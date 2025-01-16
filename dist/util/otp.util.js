"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOtp = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_controller_1 = require("../controller/user.controller");
const logger_1 = require("../logger");
const checkOtp = function (req, res) {
    const otp = req.body.oneTimePassword;
    if (otp !== user_controller_1.handleOtp.getOneTimePassword()) {
        logger_1.logger.error("Invalid OTP");
        res.status(http_status_codes_1.default.UNAUTHORIZED).json({
            status: http_status_codes_1.default.UNAUTHORIZED,
            message: "Invalid OTP",
            data: null
        });
        return;
    }
    res.status(http_status_codes_1.default.OK).json({
        status: http_status_codes_1.default.OK,
        message: "Otp is valid",
        data: null
    });
};
exports.checkOtp = checkOtp;
