import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;
import "winston-daily-rotate-file";


const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message}`;
    })
);


export const logger = createLogger({
    level: "info",
    format: combine(colorize(), timestamp(), json()),
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
