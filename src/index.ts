import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });
import { dbConnection } from "./dbconnection/db.connection";
import userRouter from "./routes/user.router";

const app = express();

dbConnection();

app.use(express.json())

app.use("/api/v1/users",userRouter);

app.use("/api/v1/notes");

app.listen(process.env.PORT, () => console.log(`Server is running on port http://localhost:${process.env.PORT}`));