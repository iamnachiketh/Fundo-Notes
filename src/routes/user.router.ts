import express from "express";
import * as UserController from "../controller/user.controller";

const router = express.Router();

router.post("/register", UserController.handleRegisterUser);

export default router;