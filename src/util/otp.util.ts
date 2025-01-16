import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { handleOtp } from "../controller/user.controller";
import { logger } from "../logger";


export const checkOtp = function (req: Request, res: Response) {
    const otp = req.body.oneTimePassword;

    if (otp !== handleOtp.getOneTimePassword()) {

        logger.error("Invalid OTP");
        res.status(httpStatus.UNAUTHORIZED).json({
            status: httpStatus.UNAUTHORIZED,
            message: "Invalid OTP",
            data: null
        });

        return;
    }

    res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        message: "Otp is valid",
        data: null
    });
}
