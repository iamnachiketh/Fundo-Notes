"use strict";
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
exports.addToArchive = exports.updateNotes = exports.deleteNotesFromTrash = exports.trashNotesById = exports.getAllNotes = exports.checkNoteId = exports.getNoteById = exports.createNote = void 0;
const note_model_1 = __importDefault(require("../models/note.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = __importDefault(require("../models/user.model"));
const redis_config_1 = __importDefault(require("../config/redis.config"));
const logger_1 = require("../logger");
const mongoose_1 = __importDefault(require("mongoose"));
const createNote = function (notes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isNotePresentRedisCache = yield redis_config_1.default.get(`notes:${notes.userEmail}:${notes.noteId}`);
            if (isNotePresentRedisCache) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            let isNoteAlreadyPresent = yield note_model_1.default.findOne({ noteId: notes.noteId });
            if (isNoteAlreadyPresent) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            let userUpdateResult = yield user_model_1.default.findOneAndUpdate({ email: notes.userEmail }, {
                $push: {
                    notesId: notes.noteId
                },
                $inc: {
                    notesCount: 1
                }
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
            yield redis_config_1.default.set(`notes:${notes.userEmail}:${notes.noteId}`, JSON.stringify(note));
            return { status: http_status_codes_1.default.CREATED, message: "Note has been created" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.createNote = createNote;
const getNoteById = function (noteId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const noteData = yield redis_config_1.default.get(`${email}:${noteId}`);
            if (noteData) {
                return { status: http_status_codes_1.default.OK, data: JSON.parse(noteData) };
            }
            let note = yield note_model_1.default.findOne({ noteId: noteId, userEmail: email }, { _id: 0, __v: 0 });
            if (!note) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found" };
            }
            yield redis_config_1.default.setEx(`${email}:${noteId}`, 3600, JSON.stringify(note));
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
        try {
            const totalDocument = yield note_model_1.default.countDocuments({ userEmail: email });
            let notes = yield redis_config_1.default.lRange(`${email}:notes`, skip, skip + limit - 1);
            logger_1.logger.info(notes);
            if (notes.length !== 0) {
                let newNotes = notes.map(value => JSON.parse(value));
                return { status: http_status_codes_1.default.OK, data: newNotes, totalDocument: totalDocument };
            }
            const result = yield note_model_1.default
                .find({ userEmail: email, isTrash: false, isArchive: false }, { _id: 0, __v: 0 })
                .skip(skip)
                .limit(limit);
            result.forEach((value) => __awaiter(this, void 0, void 0, function* () { return yield redis_config_1.default.lPush(`${email}:notes`, JSON.stringify(value)); }));
            return { status: http_status_codes_1.default.OK, data: result, totalDocument: totalDocument };
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
        try {
            yield note_model_1.default.findOneAndUpdate({ noteId: noteId }, {
                $set: {
                    isTrash: true
                }
            }, { session });
            yield user_model_1.default.findOneAndUpdate({ email: userEmail }, {
                $pull: {
                    notesId: noteId
                },
                $inc: {
                    notesCount: -1
                }
            }, { session });
            yield redis_config_1.default.del(`${userEmail}:${noteId}`);
            yield session.commitTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.OK, message: "Notes has been trashed" };
        }
        catch (error) {
            yield session.abortTransaction();
            session.endSession();
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.trashNotesById = trashNotesById;
const deleteNotesFromTrash = function (noteId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield note_model_1.default.findOneAndDelete({ noteId: noteId, isTrash: true });
            return { status: http_status_codes_1.default.GONE, message: "Note has been deleted from trash" };
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
            let result = yield note_model_1.default.findOneAndUpdate({ noteId: data.noteId }, {
                $set: {
                    title: data === null || data === void 0 ? void 0 : data.title,
                    desc: data === null || data === void 0 ? void 0 : data.desc
                }
            }, { new: true });
            let note = yield redis_config_1.default.get(`${data.userEmail}:${data.noteId}`);
            if (note) {
                let newNote = JSON.parse(note);
                if (data.title !== undefined)
                    newNote.title = data.title;
                if (data.desc !== undefined)
                    newNote.desc = data.desc;
                yield redis_config_1.default.set(`${data.userEmail}:${data.noteId}`, JSON.stringify(newNote));
            }
            else {
                yield redis_config_1.default.setEx(`${data.userEmail}:${data.noteId}`, 3600, JSON.stringify(result));
            }
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
        try {
            const cachedNote = yield redis_config_1.default.get(`${userEmail}:${noteId}`);
            if (cachedNote) {
                const note = JSON.parse(cachedNote);
                note.isArchive = true;
                yield redis_config_1.default.setEx(`${userEmail}:${noteId}`, 3600, JSON.stringify(note));
            }
            const result = yield note_model_1.default.findOneAndUpdate({ noteId: noteId, isArchive: false, isTrash: false }, {
                $set: {
                    isArchive: true
                }
            });
            if (!result) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Note not found or already archived." };
            }
            if (!cachedNote) {
                yield redis_config_1.default.setEx(`${userEmail}:${noteId}`, 3600, JSON.stringify(result));
            }
            return { status: http_status_codes_1.default.OK, message: "Note has been Archived" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.addToArchive = addToArchive;
