import express from "express";
import * as UserController from "../controller/user.controller";

const router = express.Router();

router.post("/register", UserController.handleRegisterUser);

router.post("/login", UserController.handleLoginUser);

export default router;