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
exports.createNote = void 0;
const note_model_1 = __importDefault(require("../models/note.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createNote = function (notes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
                desc: notes.desc
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
