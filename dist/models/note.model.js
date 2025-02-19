"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NoteSchema = new mongoose_1.default.Schema({
    noteId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isTrash: { type: Boolean, default: false },
    isArchive: { type: Boolean, default: false },
    color: { type: String, default: "white" }
});
exports.default = mongoose_1.default.model("notes", NoteSchema);
