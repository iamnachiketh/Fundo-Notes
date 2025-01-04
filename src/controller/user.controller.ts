import * as UserService from "../service/user.service";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";

export const handleRegisterUser = async function (req: Request, res: Response) {

    let data = req.body;

    try{
        const hash = await bcrypt.hash(data.password, 10);

        data.password = hash;

        const response = await UserService.registerUser(data);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    }catch(error:any){
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

    let data = req.body;

    try{
        const response = await UserService.loginUser(data);
        if (response.message === undefined)
            res.status(response.status).json({ status: response.status, messsage: "User logged in successfully", data: response.UserDetails });
        else
            res.status(response.status).json({ status: response.status, messsage: response.message, data: null });
    }catch(error:any){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    }

    // This is another way of doing it 

    // UserService
    //     .loginUser(data)
    //     .then((response) => {
    //         if (response.message === undefined)
    //             res.status(response.status).json({ status: response.status, messsage: "User logged in successfully", data: response.UserDetails });
    //         else
    //             res.status(response.status).json({ status: response.status, messsage: response.message, data: null });
    //     })
}