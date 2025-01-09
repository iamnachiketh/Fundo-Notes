"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const { combine, timestamp, json, colorize } = winston_1.format;
require("winston-daily-rotate-file");
const consoleLogFormat = winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
}));
exports.logger = (0, winston_1.createLogger)({
    level: "info",
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new winston_1.transports.Console({
            format: consoleLogFormat,
            level: "debug",
            handleExceptions: true,
        }),
        new winston_1.transports.File({
            filename: "./log/app.log",
            level: "debug",
            handleExceptions: true
        }),
        new winston_1.transports.DailyRotateFile({
            maxFiles: "14d",
            level: "info",
            dirname: "log",
            datePattern: "YYYY-MM-DD",
            filename: "./log/app.log"
        })
    ],
});
