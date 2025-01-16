"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../logger");
const dbConnection = function () {
    mongoose_1.default.connect(process.env.MONGO_URI)
        .then(() => logger_1.logger.info("Connected to the database"))
        .catch((err) => logger_1.logger.error(err.message));
};
exports.dbConnection = dbConnection;
