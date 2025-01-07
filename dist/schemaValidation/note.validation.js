"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNote = void 0;
const express_validator_1 = require("express-validator");
const validateNote = function () {
    (0, express_validator_1.body)('noteId').notEmpty().isString(),
        (0, express_validator_1.body)('userEmail').notEmpty().isString(),
        (0, express_validator_1.body)('title').notEmpty().isString(),
        (0, express_validator_1.body)('desc').notEmpty().isString();
};
exports.validateNote = validateNote;
