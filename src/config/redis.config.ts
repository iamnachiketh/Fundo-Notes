import { createClient } from "redis";
import { logger } from "../logger";

const redisClient = createClient({
    url: process.env.REDIS_URI
});

console.log(process.env.REDIS_URI);

redisClient.on("connect", () => {
    logger.info("Connected to Redis");
});

redisClient.on("error", (err) => {
    logger.error(`Error has been occured: ${err}`);
});


redisClient
    .connect()
    .catch((err) => {
        logger.error(`Error has been occured: ${err}`);
    });

export default redisClient;