import * as UserService from "../service/user.service";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";

export const handleRegisterUser = async function (req: Request, res: Response) {

    let data = req.body;

    bcrypt.hash(data.password, 10)
    .then((hash)=>{
        data.password = hash;
        return UserService.registerUser(data);
    })
    .then((response) => {
        res.status(response.status).json(response.message);
    })
    .catch((error)=>{
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error.message);
        return;
    })
    
}