import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });
import { dbConnection } from "./dbconnection/db.connection";

const app = express();

dbConnection();

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));