import express from "express";
import * as UserController from "../controller/user.controller";
import * as AuthMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", AuthMiddleware.createJWToken, UserController.handleRegisterUser);

router.post("/login", AuthMiddleware.createJWToken,UserController.handleLoginUser);

export default router;