"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
const db_connection_1 = require("./dbconnection/db.connection");
const user_router_1 = __importDefault(require("./routes/user.router"));
const app = (0, express_1.default)();
(0, db_connection_1.dbConnection)();
app.use(express_1.default.json());
app.use("/api/v1/users", user_router_1.default);
app.listen(process.env.PORT, () => console.log(`Server is running on port http://localhost:${process.env.PORT}`));
