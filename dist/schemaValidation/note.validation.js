"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateNote = void 0;
const express_validator_1 = require("express-validator");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.validateNote = [
    (0, express_validator_1.check)("noteId")
        .isString()
        .notEmpty()
        .withMessage("Note ID is required and must be a string.")
        .isLength({ min: 1 })
        .withMessage("Note ID must be unique and non-empty."),
    (0, express_validator_1.check)("userEmail")
        .isEmail()
        .withMessage("A valid email is required."),
    (0, express_validator_1.check)("title")
        .isString()
        .notEmpty()
        .withMessage("Title is required and must be a string."),
    (0, express_validator_1.check)("desc")
        .isString()
        .notEmpty()
        .withMessage("Description is required and must be a string."),
    (0, express_validator_1.check)("isTrash")
        .optional()
        .isBoolean()
        .withMessage("isTrash must be a boolean value."),
    (0, express_validator_1.check)("isArchive")
        .optional()
        .isBoolean()
        .withMessage("isArchive must be a boolean value."),
    (0, express_validator_1.check)("color")
        .optional()
        .isString()
        .withMessage("Color must be a string."),
];
const validate = function (req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(http_status_codes_1.default.BAD_REQUEST).json({ status: http_status_codes_1.default.BAD_REQUEST, message: errors.array(), data: null });
        return;
    }
    next();
};
exports.validate = validate;
