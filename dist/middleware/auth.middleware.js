"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createJWToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createJWToken = function (email) {
    const accessToken = jsonwebtoken_1.default.sign({ email: email }, process.env.JWT_SECERT, { expiresIn: "3d" });
    const refreshToken = jsonwebtoken_1.default.sign({ email: email }, process.env.JWT_SECERT, { expiresIn: "30d" });
    if (!accessToken || !refreshToken)
        return { token: null };
    else
        return {
            token: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        };
};
exports.createJWToken = createJWToken;
const verifyToken = function (req, res, next) {
    let token = req.headers["x-token"];
    if (!token) {
        res.status(http_status_codes_1.default.UNAUTHORIZED).json({ status: http_status_codes_1.default.UNAUTHORIZED, message: "Token not provided", data: null });
        return;
    }
    if (typeof token === "string") {
        token = token.split(/\s+/)[1];
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECERT);
    if (!payload) {
        res.status(http_status_codes_1.default.UNAUTHORIZED).json({ status: http_status_codes_1.default.UNAUTHORIZED, message: "Invalid token", data: null });
        return;
    }
    req.body.payload = payload;
    next();
};
exports.verifyToken = verifyToken;
