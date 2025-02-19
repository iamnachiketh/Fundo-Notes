"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoteColor = exports.unarchiveNote = exports.restoreNote = exports.getAllFromTrash = exports.getAllFromArchive = exports.searchNote = exports.addToArchive = exports.updateNotes = exports.deleteNotesFromTrash = exports.trashNotesById = exports.getAllNotes = exports.checkNoteId = exports.getNoteById = exports.createNote = void 0;
const note_model_1 = __importDefault(require("../models/note.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = __importDefault(require("../models/user.model"));
const redis_config_1 = __importDefault(require("../config/redis.config"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../logger");
const NoteHelper = __importStar(require("../helper/note.helper"));
const createNote = function (notes) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        const redisNoteKey = `notes:${notes.userEmail}:${notes.noteId}`;
        const redisUserNotesKey = `${notes.userEmail}:notes`;
        try {
            let isNotePresentRedisCache = yield redis_config_1.default.get(redisNoteKey);
            if (isNotePresentRedisCache) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            let isNoteAlreadyPresent = yield note_model_1.default.findOne({ noteId: notes.noteId });
            if (isNoteAlreadyPresent) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            let userUpdateResult = yield user_model_1.default.findOneAndUpdate({ email: notes.userEmail }, {
                $push: { notesId: notes.noteId },
                $inc: { notesCount: 1 }
            });
            if (!userUpdateResult) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "User not found" };
            }
            const note = new note_model_1.default({
                noteId: notes.noteId,
                userEmail: notes.userEmail,
                title: notes.title,
                desc: notes.desc,
                isArchive: notes === null || notes === void 0 ? void 0 : notes.isArchive,
                color: notes === null || notes === void 0 ? void 0 : notes.color
            });
            yield note.save();
            yield session.commitTransaction();
            session.endSession();
            yield redis_config_1.default.set(redisNoteKey, JSON.stringify(note), { "EX": 3600 });
            yield redis_config_1.default.lPush(redisUserNotesKey, JSON.stringify(note));
            return { status: http_status_codes_1.default.CREATED, message: "Note has been created", data: note };
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.createNote = createNote;
const getNoteById = function (noteId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `notes:${email}:${noteId}`;
        try {
            let noteData;
            try {
                noteData = yield redis_config_1.default.get(redisKey);
            }
            catch (redisError) {
                logger_1.logger.error(redisError.message);
            }
            if (noteData) {
                const parsedData = JSON.parse(noteData);
                if (parsedData.notFound) {
                    return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found" };
                }
                return { status: http_status_codes_1.default.OK, data: parsedData };
            }
            const note = yield note_model_1.default.findOne({ noteId: noteId, userEmail: email }, { _id: 0, __v: 0 });
            if (!note) {
                yield redis_config_1.default.setEx(redisKey, 3600, JSON.stringify({ notFound: true }));
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found" };
            }
            yield redis_config_1.default.setEx(redisKey, 3600, JSON.stringify(note));
            return { status: http_status_codes_1.default.OK, data: note };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.getNoteById = getNoteById;
const checkNoteId = function (noteId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield user_model_1.default.findOne({ email: email });
        if (user === null || user === void 0 ? void 0 : user.notesId.includes(noteId)) {
            return { value: true };
        }
        return { value: false };
    });
};
exports.checkNoteId = checkNoteId;
const getAllNotes = function (email, skip, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisUserNotesKey = `${email}:notes`;
        const redisTotalDocsKey = `${email}:totalDocuments`;
        try {
            let totalDocument;
            try {
                totalDocument = yield redis_config_1.default.get(redisTotalDocsKey);
            }
            catch (redisError) {
                logger_1.logger.error(redisError.message);
            }
            if (!totalDocument) {
                totalDocument = yield note_model_1.default.countDocuments({ userEmail: email });
                yield redis_config_1.default.setEx(redisTotalDocsKey, 3600, totalDocument.toString());
            }
            else {
                totalDocument = parseInt(totalDocument, 10);
            }
            let notes;
            try {
                notes = yield redis_config_1.default.lRange(redisUserNotesKey, 0, -1);
            }
            catch (redisError) {
                logger_1.logger.error(redisError.message);
            }
            if (notes && notes.length > 0) {
                const slicedNotes = NoteHelper.getNotesOfARange(notes, skip, limit);
                if (slicedNotes.length > 0) {
                    const parsedNotes = slicedNotes.map(note => JSON.parse(note));
                    return { status: http_status_codes_1.default.OK, data: parsedNotes, totalDocument };
                }
            }
            let result = yield note_model_1.default.find({ userEmail: email, isTrash: false, isArchive: false }, { _id: 0, __v: 0 })
                .sort({ noteId: -1 });
            yield redis_config_1.default.del(redisUserNotesKey);
            if (result.length > 0) {
                const pipeline = redis_config_1.default.multi();
                result.forEach(note => pipeline.rPush(redisUserNotesKey, JSON.stringify(note)));
                pipeline.expire(redisUserNotesKey, 3600);
                yield pipeline.exec();
            }
            result = result.slice(skip, skip + limit);
            return { status: http_status_codes_1.default.OK, data: result, totalDocument };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.getAllNotes = getAllNotes;
const trashNotesById = function (noteId, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        const indivisualNoteKey = `notes:${userEmail}:${noteId}`;
        try {
            const noteUpdate = yield note_model_1.default.findOneAndUpdate({ noteId: noteId, isTrash: false }, { $set: { isTrash: true, isArchive: false } }, { session });
            if (!noteUpdate) {
                throw new Error("Note not found");
            }
            const userUpdate = yield user_model_1.default.findOneAndUpdate({ email: userEmail }, {
                $pull: { notesId: noteId },
                $inc: { notesCount: -1 },
            }, { session });
            if (!userUpdate) {
                throw new Error("User not found");
            }
            yield session.commitTransaction();
            session.endSession();
            yield NoteHelper.updateRedisArchiveOrTrash(noteId, userEmail);
            return { status: http_status_codes_1.default.OK, message: "Note has been trashed", data: noteUpdate };
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null };
        }
    });
};
exports.trashNotesById = trashNotesById;
const deleteNotesFromTrash = function (noteId, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield note_model_1.default.findOneAndDelete({ noteId: noteId, isTrash: true });
            if (!response) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note is not present/already been deleted" };
            }
            yield redis_config_1.default.del(`notes:${userEmail}:${noteId}`);
            return { status: http_status_codes_1.default.OK, message: "Note has been deleted from trash" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.deleteNotesFromTrash = deleteNotesFromTrash;
const updateNotes = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedNote = yield note_model_1.default.findOneAndUpdate({ noteId: data.noteId }, {
                $set: Object.assign(Object.assign({}, (data.title && { title: data.title })), (data.desc && { desc: data.desc })),
            }, { new: true });
            if (!updatedNote) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: `Note with ID ${data.noteId} not found.` };
            }
            const noteKey = `notes:${data.userEmail}:${data.noteId}`;
            const noteInCache = yield redis_config_1.default.get(noteKey);
            if (noteInCache) {
                const updatedCache = JSON.parse(noteInCache);
                if (data.title !== undefined)
                    updatedCache.title = data.title;
                if (data.desc !== undefined)
                    updatedCache.desc = data.desc;
                yield redis_config_1.default.set(noteKey, JSON.stringify(updatedCache));
            }
            else {
                yield redis_config_1.default.setEx(noteKey, 3600, JSON.stringify(updatedNote));
            }
            yield NoteHelper.updateRedisCache(data);
            return { status: http_status_codes_1.default.OK, message: `Note with ID ${data.noteId} has been updated.` };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.updateNotes = updateNotes;
const addToArchive = function (noteId, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const indivisualNoteKey = `notes:${userEmail}:${noteId}`;
        try {
            const result = yield note_model_1.default.findOneAndUpdate({ noteId: noteId, isArchive: false, isTrash: false }, { $set: { isArchive: true } }, { new: true });
            if (!result) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found or already archived." };
            }
            const cachedNote = yield redis_config_1.default.get(indivisualNoteKey);
            if (cachedNote) {
                const note = JSON.parse(cachedNote);
                note.isArchive = true;
                yield redis_config_1.default.setEx(indivisualNoteKey, 3600, JSON.stringify(note));
            }
            else {
                yield redis_config_1.default.setEx(indivisualNoteKey, 3600, JSON.stringify(result));
            }
            yield NoteHelper.updateRedisArchiveOrTrash(noteId, userEmail);
            return { status: http_status_codes_1.default.OK, message: "Note has been Archived" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.addToArchive = addToArchive;
const searchNote = function (searchString, email, skip, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const redisUserNoteKey = `${email}:notes:search`;
            const notes = yield redis_config_1.default.lRange(redisUserNoteKey, 0, -1);
            if (notes.length > 0) {
                const parsedNotes = notes.map(note => JSON.parse(note));
                const searchResult = parsedNotes.filter(note => {
                    return note.title.includes(searchString) || note.desc.includes(searchString);
                });
                const slicedNotes = NoteHelper.getNotesOfARange(searchResult, skip, limit);
                return { status: http_status_codes_1.default.OK, data: slicedNotes, totalDocument: searchResult.length };
            }
            let result = yield note_model_1.default.find({
                userEmail: email,
                $or: [
                    { title: { $regex: searchString, $options: "i" } },
                    { desc: { $regex: searchString, $options: "i" } }
                ],
                isTrash: false,
                isArchive: false
            }, { _id: 0, __v: 0 })
                .sort({ noteId: -1 });
            let totalDocument = result.length;
            if (result.length > 0) {
                yield redis_config_1.default.del(redisUserNoteKey);
                const pipeline = redis_config_1.default.multi();
                result.forEach(note => pipeline.rPush(redisUserNoteKey, JSON.stringify(note)));
                pipeline.expire(redisUserNoteKey, 3600);
                yield pipeline.exec();
            }
            result = result.slice(skip, skip + limit);
            return { status: http_status_codes_1.default.OK, data: result, totalDocument };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.searchNote = searchNote;
const getAllFromArchive = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield note_model_1.default.find({
                userEmail: email, isArchive: true, isTrash: false
            }, { _id: 0, __v: 0 })
                .sort({ noteId: -1 });
            if (response.length <= 0) {
                return { status: http_status_codes_1.default.OK, message: "No Notes present", data: null };
            }
            return { status: http_status_codes_1.default.OK, message: "List of Notes", data: response };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null };
        }
    });
};
exports.getAllFromArchive = getAllFromArchive;
const getAllFromTrash = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield note_model_1.default
                .find({ userEmail: email, isTrash: true }, { _id: 0, __v: 0 })
                .sort({ noteId: -1 });
            if (response.length <= 0) {
                return { status: http_status_codes_1.default.OK, message: "No Note in the trash", data: null };
            }
            return { status: http_status_codes_1.default.OK, message: "List of the trash notes", data: response };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null };
        }
    });
};
exports.getAllFromTrash = getAllFromTrash;
const restoreNote = function (noteId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const response = yield user_model_1.default.findOneAndUpdate({ email: email }, {
                $push: {
                    notesId: noteId
                },
                $inc: {
                    notesCount: 1
                }
            }, { new: true });
            if (!response) {
                yield session.abortTransaction();
                session.endSession();
                return { status: http_status_codes_1.default.NOT_FOUND, message: "User Not Found" };
            }
            const result = yield note_model_1.default.findOneAndUpdate({ userEmail: email, noteId: noteId }, {
                $set: {
                    isTrash: false
                }
            }, { new: true });
            if (!result) {
                yield session.abortTransaction();
                session.endSession();
                return { status: http_status_codes_1.default.NOT_FOUND, message: `Note with id ${noteId} does not exist` };
            }
            yield NoteHelper.updateRedisUnarchiveOrRestore(email, result);
            yield session.commitTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.OK, message: "Note has been restored" };
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.restoreNote = restoreNote;
const unarchiveNote = function (noteId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const indivisualNote = `notes:${email}:${noteId}`;
        try {
            const response = yield note_model_1.default.findOneAndUpdate({
                noteId: noteId,
                isArchive: true
            }, {
                $set: {
                    isArchive: false
                }
            }, { new: true });
            if (!response) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note Not found", data: null };
            }
            yield redis_config_1.default.del(indivisualNote);
            yield redis_config_1.default.set(indivisualNote, JSON.stringify(response), { "EX": 3600 });
            yield NoteHelper.updateRedisUnarchiveOrRestore(email, response);
            return { status: http_status_codes_1.default.OK, message: "Note has Unarchived", data: null };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null };
        }
    });
};
exports.unarchiveNote = unarchiveNote;
const updateNoteColor = function (noteId, color, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisNoteKey = `notes:${email}:${noteId}`;
        const redisNoteListKey = `${email}:notes`;
        try {
            const response = yield note_model_1.default.findOneAndUpdate({ noteId: noteId }, { $set: { color: color } }, { new: true });
            if (!response) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found", data: null };
            }
            yield redis_config_1.default.del(redisNoteKey);
            yield redis_config_1.default.set(redisNoteKey, JSON.stringify(response), { "EX": 3600 });
            let noteList = yield redis_config_1.default.lRange(redisNoteListKey, 0, -1);
            yield redis_config_1.default.del(redisNoteListKey);
            if (noteList && noteList.length > 0) {
                noteList = noteList.filter((value) => JSON.parse(value).noteId !== noteId);
                noteList.push(JSON.stringify(response));
                const pipeline = redis_config_1.default.multi();
                noteList.forEach((note) => pipeline.rPush(redisNoteListKey, note));
                pipeline.expire(redisNoteListKey, 3600);
                yield pipeline.exec();
            }
            return { status: http_status_codes_1.default.OK, message: "Note color has been updated", data: response };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null };
        }
    });
};
exports.updateNoteColor = updateNoteColor;
