import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";

export const createJWToken = function (email: string): { token: { accessToken: string, refreshToken: string } | null } {

    const accessToken = jwt.sign({ email: email }, process.env.JWT_SECERT as string, { expiresIn: "3d" });

    const refreshToken = jwt.sign({ email: email }, process.env.JWT_SECERT as string, { expiresIn: "30d" })

    if (!accessToken || !refreshToken)
        return { token: null };
    else
        return {
            token: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
}


export const verifyToken = function (req: Request, res: Response, next: NextFunction) {

    let token = req.headers["x-token"];

    if (!token) {
        res.status(httpStatus.UNAUTHORIZED).json({ status: httpStatus.UNAUTHORIZED, message: "Token not provided", data: null });
        return;
    }

    if (typeof token === "string") {
        token = token.split(/\s+/)[1];
    }

    const payload = jwt.verify(token as string, process.env.JWT_SECERT as string);

    if (!payload) {
        res.status(httpStatus.UNAUTHORIZED).json({ status: httpStatus.UNAUTHORIZED, message: "Invalid token", data: null });
        return;
    }

    req.body.payload = payload;
    next();
}








