"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRouter = void 0;
const user_router_1 = __importDefault(require("../routes/user.router"));
const note_router_1 = __importDefault(require("../routes/note.router"));
const express_1 = require("express");
const handleRouter = function () {
    const router = (0, express_1.Router)();
    router.use("/users", user_router_1.default);
    router.use("/notes", note_router_1.default);
    return router;
};
exports.handleRouter = handleRouter;