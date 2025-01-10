import * as UserService from "../service/user.service";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";

export const handleRegisterUser = async function (req: Request, res: Response) {

    const data = req.body;

    try {
        const hash = await bcrypt.hash(data.password, 10);

        data.password = hash;

        const response = await UserService.registerUser(data);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
        return;
    }

    // This is another way of doing it

    // bcrypt.hash(data.password, 10)
    //     .then((hash) => {
    //         data.password = hash;
    //         return UserService.registerUser(data);
    //     })
    //     .then((response) => {
    //         res.status(response.status).json({ status: response.status, message: response.message, data: null });
    //     })
    //     .catch((error) => {
    //         res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    //         return;
    //     })

}



export const handleLoginUser = async function (req: Request, res: Response) {

    const data = req.body;

    try {
        const response = await UserService.loginUser(data);
        if (response.message === undefined)
            res.status(response.status).json({
                status: response.status,
                messsage: "User logged in successfully",
                data: response.UserDetails,
                accessToken: response.token?.accessToken,
                refreshToken: response.token?.refreshToken
            });
        else
            res.status(response.status).json({ status: response.status, messsage: response.message, data: null });
    } catch (error: any) {

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: null
        });

    }
}


export const handleGetRefreshToken = async function (req: Request, res: Response) {
    try {

        const { payload, ...data } = req.body;
        if (data.email !== payload.email) {
            res.status(httpStatus.UNAUTHORIZED).json({ status: httpStatus.UNAUTHORIZED, message: "Invalid User", data: null });
            return;
        }

        const response = await UserService.getRefreshToken(data.email);

        res.status(response.status).json({
            status: response.status,
            message: response.message,
            token: response.token
        });

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({
                status: httpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
    }
}

const otpGetterSetter = function () {
    let _oneTimePassword: String;

    return {
        setOneTimePassword: function (otp: String) {
            _oneTimePassword = otp;
        },
        getOneTimePassword: function () {
            return _oneTimePassword;
        }
    }
}

export let handleOtp: any;

export const handleGetForgetPassword = async function (req: Request, res: Response) {
    try {
        const email = req.body.email;

        if (!email) {
            res.status(httpStatus.BAD_REQUEST).json({

                status: httpStatus.BAD_REQUEST,
                message: "Please Enter the email",
                data: null

            })
        }

        const response = await UserService.getForgetPassword(email);

        if (!response.oneTimePassword) {
            res.status(response.status).json({
                status: response.status,
                message: response.message,
                data: null
            });
            return;
        }

        const oneTimePassword = response.oneTimePassword;

        handleOtp = otpGetterSetter();

        handleOtp.setOneTimePassword(oneTimePassword);



        res.status(response.status).json({
            status: response.status,
            message: response.message,
            otp: handleOtp.getOneTimePassword(),
            data: null
        })


    } catch (error: any) {

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: null
        });

    }
}

export const handleResetPassword = async function (req: Request, res: Response) {
    try {
        const data: any = req.body;

        data.password = await bcrypt.hash(data.password, 10);

        const response = await UserService.resetPassword(data);

        res.status(response.status).json({
            status: response.status,
            message: response.message,
            data: null
        });

    } catch (error: any) {

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            data: null

        })
    }
}