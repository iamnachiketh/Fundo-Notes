"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)();
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
redisClient
    .connect()
    .catch((err) => {
    console.error('Redis connection failed:', err);
});
exports.default = redisClient;
