import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";

export const createJWToken = function (req: Request, res: Response, next: NextFunction) {

    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECERT as string, { expiresIn: "3d" });

    if (!token) {
        res.status(httpStatus.NOT_IMPLEMENTED).json({ status: httpStatus.NOT_IMPLEMENTED, message: "Token not generated", data: null });
    } else {
        req.body.token = token;
        next();
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

