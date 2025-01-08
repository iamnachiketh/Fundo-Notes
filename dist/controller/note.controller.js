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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddToArchive = exports.handleUpdateNotes = exports.handleDeleteNotesFromTrash = exports.handleDeleteById = exports.handleGetAllNotesOfAUser = exports.handleGetNoteById = exports.handleCreateNote = void 0;
const NoteService = __importStar(require("../service/note.service"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const handleCreateNote = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            if (data.userEmail !== payload.email) {
                res.status(http_status_codes_1.default.FORBIDDEN).json({ status: http_status_codes_1.default.FORBIDDEN, message: "Invalid User", data: null });
                return;
            }
            const response = yield NoteService.createNote(data);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleCreateNote = handleCreateNote;
const handleGetNoteById = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            const response = yield NoteService.getNoteById(noteId);
            if (response.message === undefined)
                res.status(response.status).json({ status: response.status, message: "Data has been created", data: response.data });
            else
                res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleGetNoteById = handleGetNoteById;
const handleGetAllNotesOfAUser = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            if (data.userEmail !== payload.email) {
                res.status(http_status_codes_1.default.FORBIDDEN).json({ status: http_status_codes_1.default.FORBIDDEN, message: "Invalid User", data: null });
                return;
            }
            const response = yield NoteService.getAllNotes(data.userEmail);
            if (response.message === undefined)
                res.status(response.status).json({ status: http_status_codes_1.default.OK, message: "List of Notes", data: response.data });
            else
                res.status(response.status).json({ status: http_status_codes_1.default.OK, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleGetAllNotesOfAUser = handleGetAllNotesOfAUser;
const handleDeleteById = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            let response = yield NoteService.deleteNotesById(noteId, data.userEmail);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleDeleteById = handleDeleteById;
const handleDeleteNotesFromTrash = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            if (data.userEmail !== payload.email) {
                res.status(http_status_codes_1.default.FORBIDDEN).json({ status: http_status_codes_1.default.FORBIDDEN, message: "Invalid User", data: null });
                return;
            }
            const response = yield NoteService.deleteNotesFromTrash(noteId);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INSUFFICIENT_SPACE_ON_RESOURCE, message: error.message, data: null });
        }
    });
};
exports.handleDeleteNotesFromTrash = handleDeleteNotesFromTrash;
const handleUpdateNotes = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.body.noteId;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            const response = yield NoteService.updateNotes(noteId);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleUpdateNotes = handleUpdateNotes;
const handleAddToArchive = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.body.noteId;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            const response = yield NoteService.addToArchive(noteId);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleAddToArchive = handleAddToArchive;
