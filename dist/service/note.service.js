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
exports.getAllNotes = exports.checkNoteId = exports.getNoteById = exports.createNote = void 0;
const note_model_1 = __importDefault(require("../models/note.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createNote = function (notes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
            return { status: http_status_codes_1.default.CREATED, message: "Note has been created" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.createNote = createNote;
const getNoteById = function (noteId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let note = yield note_model_1.default.findOne({ noteId: noteId }, { _id: 0, __v: 0 });
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
            return true;
        }
        return false;
    });
};
exports.checkNoteId = checkNoteId;
const getAllNotes = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield note_model_1.default.find({ userEmail: email }, { _id: 0, __v: 0 });
            // This is another way of getting the list of notes
            // let result: Array<any> = [];
            // let totalNumberOfNotes = user?.notesId.length === undefined ? 0 : user?.notesId.length;
            // for (let i = 0; i < totalNumberOfNotes; i++) {
            //     let response = await Note.findOne({ noteId: user?.notesId[i] }, { _id: 0, __v: 0 });
            //     result.push(response);
            // }
            // if (result.length === 0) return { status: httpStatus.OK, message: "No Note is created yet" };
            return { status: http_status_codes_1.default.OK, data: result };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.getAllNotes = getAllNotes;
// export const deleteNotesById = async function(noteId:string):Promise<{ status: number, message: string }>{
// }
