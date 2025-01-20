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
const createNote = function (notes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let isNotePresentRedisCache = yield redis_config_1.default.get(`${notes.userEmail}:${notes.noteId}`);
            if (isNotePresentRedisCache) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            let isNoteAlreadyPresent = yield note_model_1.default.findOne({ noteId: notes.noteId });
            if (isNoteAlreadyPresent) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "Note already exists" };
            }
            yield user_model_1.default.findOneAndUpdate({ email: notes.userEmail }, {
                $push: {
                    notesId: notes.noteId
                },
                $inc: {
                    notesCount: 1
                }
            });
            const note = new note_model_1.default({
                noteId: notes.noteId,
                userEmail: notes.userEmail,
                title: notes.title,
                desc: notes.desc,
                isArchive: notes === null || notes === void 0 ? void 0 : notes.isArchive,
                color: notes === null || notes === void 0 ? void 0 : notes.color
            });
            yield note.save();
            yield redis_config_1.default.setEx(`${notes.userEmail}:${notes.noteId}`, 3600, JSON.stringify(note));
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
            let notes = yield redis_config_1.default.get(`${email}:notes`);
            if (notes) {
                return { status: http_status_codes_1.default.OK, data: JSON.parse(notes), totalDocument: totalDocument };
            }
            const result = yield note_model_1.default
                .find({ userEmail: email, isTrash: false, isArchive: false }, { _id: 0, __v: 0 })
                .skip(skip)
                .limit(limit);
            // This is another way of getting the list of notes
            // let result: Array<any> = [];
            // let totalNumberOfNotes = user?.notesId.length === undefined ? 0 : user?.notesId.length;
            // for (let i = 0; i < totalNumberOfNotes; i++) {
            //     let response = await Note.findOne({ noteId: user?.notesId[i] }, { _id: 0, __v: 0 });
            //     result.push(response);
            // }
            // if (result.length === 0) return { status: httpStatus.OK, message: "No Note is created yet" };
            yield redis_config_1.default.setEx(`${email}:notes`, 3600, JSON.stringify(result));
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
        try {
            yield note_model_1.default.findOneAndUpdate({ noteId: noteId }, {
                $set: {
                    isTrash: true
                }
            });
            yield user_model_1.default.findOneAndUpdate({ email: userEmail }, {
                $pull: {
                    notesId: noteId
                },
                $inc: {
                    notesCount: -1
                }
            });
            return { status: http_status_codes_1.default.OK, message: "Notes has been trashed" };
        }
        catch (error) {
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
            yield note_model_1.default.findOneAndUpdate({ noteId: data.noteId }, {
                $set: {
                    title: data === null || data === void 0 ? void 0 : data.title,
                    desc: data === null || data === void 0 ? void 0 : data.desc
                }
            });
            return { status: http_status_codes_1.default.OK, message: "Note has been updated" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.updateNotes = updateNotes;
const addToArchive = function (noteId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield note_model_1.default.findOneAndUpdate({ noteId: noteId, isArchive: false }, {
                $set: {
                    isArchive: true
                }
            });
            return { status: http_status_codes_1.default.OK, message: "Note has been Archived" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.addToArchive = addToArchive;
