"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = require("../logger");
const redisClient = (0, redis_1.createClient)();
redisClient.on("connect", () => {
    logger_1.logger.info("Connected to Redis");
});
redisClient.on("error", (err) => {
    logger_1.logger.error(`Error has been occured: ${err}`);
});
redisClient
    .connect()
    .catch((err) => {
    logger_1.logger.error(`Error has been occured: ${err}`);
});
exports.default = redisClient;
