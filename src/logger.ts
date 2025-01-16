import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";


const consoleLogFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A"
    }),
    format.align(),
    format.printf((info) => {
        return `[${info.timestamp}] ${info.level}: ${info.message}`;
    })
);


export const logger = createLogger({
    level: "info",
    format: consoleLogFormat,
    transports: [
        new transports.Console({
            format: consoleLogFormat,
            level: "debug",
            handleExceptions: true,
        }),
        new transports.File({
            filename: "./log/app.log",
            level: "debug",
            handleExceptions: true
        }),
        new transports.DailyRotateFile({
            maxFiles: "14d",
            level: "info",
            dirname: "log",
            datePattern: "YYYY-MM-DD",
            filename: "./log/app.log"
        })

    ],
});
