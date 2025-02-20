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
exports.updateRedisUnarchiveOrRestore = exports.updateRedisArchiveOrTrash = exports.updateRedisCache = exports.getNotesOfARange = void 0;
const redis_config_1 = __importDefault(require("../config/redis.config"));
const logger_1 = require("../logger");
const getNotesOfARange = function (notes, skip, limit) {
    return notes.slice(skip, skip + limit);
};
exports.getNotesOfARange = getNotesOfARange;
const updateRedisCache = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        const listKey = `${data.userEmail}:notes`;
        try {
            const notes = yield redis_config_1.default.lRange(listKey, 0, -1);
            if (notes && notes.length > 0) {
                const updatedNotes = notes.map(note => {
                    const parsedNote = JSON.parse(note);
                    if (parsedNote.noteId === data.noteId) {
                        if (data.title !== undefined)
                            parsedNote.title = data.title;
                        if (data.desc !== undefined)
                            parsedNote.desc = data.desc;
                    }
                    return JSON.stringify(parsedNote);
                });
                const pipeline = redis_config_1.default.multi();
                yield redis_config_1.default.del(listKey);
                updatedNotes.forEach(note => pipeline.rPush(listKey, note));
                pipeline.expire(listKey, 3600);
                yield pipeline.exec();
            }
        }
        catch (error) {
            logger_1.logger.error(error.message);
        }
    });
};
exports.updateRedisCache = updateRedisCache;
const updateRedisArchiveOrTrash = function (noteId, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `${userEmail}:notes`;
        try {
            const listExists = yield redis_config_1.default.exists(redisKey);
            if (!listExists) {
                logger_1.logger.error("Redis key does not exist; skipping update.");
                return;
            }
            const notes = yield redis_config_1.default.lRange(redisKey, 0, -1);
            const filteredNotes = notes.filter(note => JSON.parse(note).noteId !== noteId);
            yield redis_config_1.default.del(redisKey);
            if (filteredNotes.length > 0) {
                const pipeline = redis_config_1.default.multi();
                filteredNotes.forEach(note => pipeline.rPush(redisKey, note));
                pipeline.expire(redisKey, 3600);
                yield pipeline.exec();
            }
        }
        catch (error) {
            logger_1.logger.error(error.message);
        }
    });
};
exports.updateRedisArchiveOrTrash = updateRedisArchiveOrTrash;
const updateRedisUnarchiveOrRestore = function (userEmail, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisNoteListKey = `${userEmail}:notes`;
        try {
            const keyExists = yield redis_config_1.default.exists(redisNoteListKey);
            if (!keyExists) {
                logger_1.logger.info("Note list Key dosent exists");
                return;
            }
            const noteList = yield redis_config_1.default.lRange(redisNoteListKey, 0, -1);
            if (noteList && noteList.length > 0) {
                yield redis_config_1.default.del(redisNoteListKey);
                noteList.push(JSON.stringify(data));
                const pipline = redis_config_1.default.multi();
                noteList.forEach((value) => pipline.rPush(redisNoteListKey, value));
                pipline.expire(redisNoteListKey, 3600);
                yield pipline.exec();
                logger_1.logger.info("Redis for unarchive/restore has been updated");
            }
        }
        catch (error) {
            logger_1.logger.error(error.message);
        }
    });
};
exports.updateRedisUnarchiveOrRestore = updateRedisUnarchiveOrRestore;
