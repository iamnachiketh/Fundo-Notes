import mongoose from "mongoose";
import { logger } from "../logger";

export const dbConnection = function () {

    mongoose.connect(process.env.MONGO_URI as string)
        .then(() => logger.info("Connected to the database"))
        .catch((err) => logger.error(err.message));
}