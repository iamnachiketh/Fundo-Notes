import express from "express";
import * as AuthMiddleware from "../middleware/auth.middleware";
import * as UserController from "../controller/user.controller";

const router = express.Router();

router.post("/register", UserController.handleRegisterUser);

router.post("/login", UserController.handleLoginUser);

router.get("/refresh-token", AuthMiddleware.verifyToken, UserController.handleGetRefreshToken);

export default router;