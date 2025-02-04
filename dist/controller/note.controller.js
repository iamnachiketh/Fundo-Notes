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
exports.handleNoteColor = exports.handleUnarchiveNote = exports.handleRestoreNote = exports.handleGetAllFromTrash = exports.handleGetAllNotesFromArchive = exports.handleSearchNotes = exports.handleAddToArchive = exports.handleUpdateNotes = exports.handleDeleteNotesFromTrash = exports.handleTrashById = exports.handleGetAllNotesOfAUser = exports.handleGetNoteById = exports.handleCreateNote = void 0;
const NoteService = __importStar(require("../service/note.service"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const logger_1 = require("../logger");
const handleCreateNote = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            if (data.userEmail !== payload.email) {
                logger_1.logger.error("Invalid User");
                res
                    .status(http_status_codes_1.default.FORBIDDEN)
                    .json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const response = yield NoteService.createNote(data);
            logger_1.logger.info(response.message);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response === null || response === void 0 ? void 0 : response.data
            });
        }
        catch (error) {
            logger_1.logger.error(error.message);
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
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
                logger_1.logger.error("Invalid User/Note dosent exists");
                res
                    .status(http_status_codes_1.default.NOT_FOUND)
                    .json({
                    status: http_status_codes_1.default.NOT_FOUND,
                    message: "Invalid User/Note dosent exists",
                    data: null
                });
                return;
            }
            const response = yield NoteService.getNoteById(noteId, data.userEmail);
            if (response.message === undefined)
                res
                    .status(response.status)
                    .json({
                    status: response.status,
                    message: "Data has been fetched",
                    data: response.data
                });
            else if (response.message === undefined) {
                logger_1.logger.info("Data has been created");
                res
                    .status(response.status)
                    .json({
                    status: response.status,
                    message: "Data has been created",
                    data: response.data
                });
            }
            else {
                logger_1.logger.error(response.message);
                res
                    .status(response.status)
                    .json({
                    status: response.status,
                    message: response.message,
                    data: null
                });
            }
        }
        catch (error) {
            logger_1.logger.error(error.message);
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetNoteById = handleGetNoteById;
const handleGetAllNotesOfAUser = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { payload } = req.body;
            const userEmail = (req.query.userEmail);
            if (userEmail !== payload.email) {
                logger_1.logger.error("Invalid User");
                res.status(http_status_codes_1.default.FORBIDDEN).json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            if (page <= 0 || limit <= 0) {
                logger_1.logger.warn("Page and limit must be positive integer");
                res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .json({
                    status: http_status_codes_1.default.BAD_REQUEST,
                    message: "Page and limit must be positive integer",
                    data: null
                });
                return;
            }
            const skip = (page - 1) * limit;
            const response = yield NoteService.getAllNotes(userEmail, skip, limit);
            const docCount = response.totalDocument === undefined ? 0 : response.totalDocument;
            const totalPages = Math.ceil(docCount / limit);
            if (response.message === undefined)
                res
                    .status(response.status)
                    .json({
                    status: http_status_codes_1.default.OK,
                    message: "List of Notes",
                    data: response.data,
                    meta: {
                        page,
                        limit,
                        docCount,
                        totalPages
                    }
                });
            else {
                logger_1.logger.error(response.message);
                res
                    .status(response.status)
                    .json({
                    status: http_status_codes_1.default.OK,
                    message: response.message,
                    data: null
                });
            }
        }
        catch (error) {
            logger_1.logger.error(error.message);
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetAllNotesOfAUser = handleGetAllNotesOfAUser;
const handleTrashById = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            console.log(noteId);
            console.log(data.userEmail);
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                logger_1.logger.error("Invalid User/Note dosent exists");
                res
                    .status(http_status_codes_1.default.NOT_FOUND)
                    .json({
                    status: http_status_codes_1.default.NOT_FOUND,
                    message: "Invalid User/Note dosent exists",
                    data: null
                });
                return;
            }
            let response = yield NoteService.trashNotesById(noteId, data.userEmail);
            logger_1.logger.info(response.message);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        }
        catch (error) {
            logger_1.logger.error(error.message);
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleTrashById = handleTrashById;
const handleDeleteNotesFromTrash = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { payload } = req.body;
            const noteId = req.params.id;
            const userEmail = (req.query.userEmail);
            if (userEmail !== payload.email) {
                logger_1.logger.error("Invalid User");
                res.status(http_status_codes_1.default.FORBIDDEN).json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const response = yield NoteService.deleteNotesFromTrash(noteId, userEmail);
            res.status(response.status).json({
                status: response.status,
                message: response.message,
                data: null
            });
        }
        catch (error) {
            logger_1.logger.error(error.message);
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message, data: null
            });
        }
    });
};
exports.handleDeleteNotesFromTrash = handleDeleteNotesFromTrash;
const handleUpdateNotes = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            data.noteId = noteId;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            const response = yield NoteService.updateNotes(data);
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
            const noteId = req.params.id;
            if (data.userEmail !== payload.email || !(yield NoteService.checkNoteId(noteId, data.userEmail)).value) {
                res.status(http_status_codes_1.default.NOT_FOUND).json({ status: http_status_codes_1.default.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
                return;
            }
            const response = yield NoteService.addToArchive(noteId, data.userEmail);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        }
    });
};
exports.handleAddToArchive = handleAddToArchive;
const handleSearchNotes = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { payload } = req.body;
            const email = (req.query.email);
            const searchQuery = (req.query.search);
            if (email !== payload.email) {
                res
                    .status(http_status_codes_1.default.FORBIDDEN)
                    .json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            if (page <= 0 || limit <= 0) {
                res
                    .status(http_status_codes_1.default.BAD_REQUEST)
                    .json({
                    status: http_status_codes_1.default.BAD_REQUEST,
                    message: "Page and limit must be positive integer",
                    data: null
                });
                return;
            }
            const skip = (page - 1) * limit;
            const response = yield NoteService.searchNote(searchQuery, email, skip, limit);
            const docCount = response.totalDocument === undefined ? 0 : response.totalDocument;
            const totalPages = Math.ceil(docCount / limit);
            if (response.message === undefined) {
                res
                    .status(response.status)
                    .json({
                    status: http_status_codes_1.default.OK,
                    message: "List of Notes",
                    data: response.data,
                    meta: { page, limit, docCount, totalPages }
                });
            }
            else {
                res
                    .status(response.status)
                    .json({
                    status: http_status_codes_1.default.OK,
                    message: response.message,
                    data: null
                });
            }
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleSearchNotes = handleSearchNotes;
const handleGetAllNotesFromArchive = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = (req.query.email);
            const { payload } = req.body;
            if (email !== payload.email) {
                logger_1.logger.error("Invalid User");
                res
                    .status(http_status_codes_1.default.FORBIDDEN)
                    .json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const response = yield NoteService.getAllFromArchive(email);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetAllNotesFromArchive = handleGetAllNotesFromArchive;
const handleGetAllFromTrash = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { payload } = req.body;
            const email = (req.query.email);
            if (email !== payload.email) {
                logger_1.logger.error("Invalid User");
                res
                    .status(http_status_codes_1.default.FORBIDDEN)
                    .json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const response = yield NoteService.getAllFromTrash(email);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetAllFromTrash = handleGetAllFromTrash;
const handleRestoreNote = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            if (data.email !== payload.email) {
                logger_1.logger.error("Invalid User");
                res
                    .status(http_status_codes_1.default.FORBIDDEN)
                    .json({
                    status: http_status_codes_1.default.FORBIDDEN,
                    message: "Invalid User",
                    data: null
                });
                return;
            }
            const response = yield NoteService.restoreNote(noteId, data.email);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: null
            });
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleRestoreNote = handleRestoreNote;
const handleUnarchiveNote = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            if (data.email !== payload.email || !(yield NoteService.checkNoteId(noteId, data.email)).value) {
                res
                    .status(http_status_codes_1.default.NOT_FOUND)
                    .json({
                    status: http_status_codes_1.default.NOT_FOUND,
                    message: "Invalid User/Note dosent exists",
                    data: null
                });
                return;
            }
            const response = yield NoteService.unarchiveNote(noteId, data.email);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleUnarchiveNote = handleUnarchiveNote;
const handleNoteColor = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            const noteId = req.params.id;
            const color = req.body.color;
            if (data.email !== payload.email || !(yield NoteService.checkNoteId(noteId, data.email)).value) {
                res
                    .status(http_status_codes_1.default.NOT_FOUND)
                    .json({
                    status: http_status_codes_1.default.NOT_FOUND,
                    message: "Invalid User/Note dosent exists",
                    data: null
                });
                return;
            }
            const response = yield NoteService.updateNoteColor(noteId, color, data.email);
            res
                .status(response.status)
                .json({
                status: response.status,
                message: response.message,
                data: response.data
            });
        }
        catch (error) {
            res
                .status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleNoteColor = handleNoteColor;
