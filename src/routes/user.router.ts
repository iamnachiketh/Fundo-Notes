import express from "express";
import * as AuthMiddleware from "../middleware/auth.middleware";
import * as UserController from "../controller/user.controller";
import * as Util from "../util/otp.util";

const router = express.Router();


router.post("/register", UserController.handleRegisterUser);


router.post("/login", UserController.handleLoginUser);

router.post("/forget-password", UserController.handleGetForgetPassword);

router.get("/refresh-token", AuthMiddleware.verifyToken, UserController.handleGetRefreshToken);

router.get("/check-otp", Util.checkOtp);

router.put("/reset-password",UserController.handleResetPassword);

export default router;