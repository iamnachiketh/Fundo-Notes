import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { dbConnection } from "./dbconnection/db.connection";
import { logger } from "./logger";
import morgan from "morgan";
import * as router from "./routes/index.router";


const app = express();

dbConnection();

app.use(express.json())

const morganFormat = ":method :url :status :response-time ms :res[content-length]";

app.use(morgan(morganFormat, {
    stream: {
        write: (message) => {
            const logObject = {
                method: message.split(" ")[0],
                url: message.split(" ")[1],
                status: message.split(" ")[2],
                responseTime: message.split(" ")[3],
            };
            logger.info(JSON.stringify(logObject));
        },
    },
}));


app.use("/api/v1", router.handleRouter());

app.listen(process.env.PORT, () => logger.info(`Server is running on port http://localhost:${process.env.PORT}`));

export default app;