"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.getForgetPassword = exports.getRefreshToken = exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const AuthMiddleware = __importStar(require("../middleware/auth.middleware"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const user_validation_1 = require("../schemaValidation/user.validation");
const nodeMailer_util_1 = require("../util/nodeMailer.util");
const rabbitMQ_util_1 = require("../util/rabbitMQ.util");
const registerUser = function (userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isUserPresent = yield user_model_1.default
                .findOne()
                .where("email")
                .equals(userData.email);
            if (isUserPresent) {
                return { status: http_status_codes_1.default.CONFLICT, message: "User already exists" };
            }
            const { error } = yield user_validation_1.userSchemaValidation.validateAsync(userData);
            if (error) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: error.message };
            }
            const user = new user_model_1.default({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                profilePictureUrl: userData.profilePictureUrl,
            });
            yield user.save();
            const emailData = {
                to: userData.email,
                from: process.env.USER_EMAIL,
                subject: "User Registered",
                body: `Hello ${userData.name}, You have been registered successfully`
            };
            const rabbitMQConnection = yield (0, rabbitMQ_util_1.connectToRabbitMQ)();
            if (rabbitMQConnection && rabbitMQConnection.sendToExchange) {
                yield rabbitMQConnection.sendToExchange(process.env.RABBITMQ_EXCHANGE, process.env.RABBITMQ_ROUTING_KEY, emailData);
            }
            else {
                return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: "Failed to connect to RabbitMQ" };
            }
            return { status: http_status_codes_1.default.CREATED, message: "User registered successfully" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.registerUser = registerUser;
const loginUser = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findOne({ email: data.email }, { _id: 0, __v: 0 });
            if (!user) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "User not found" };
            }
            const isPasswordMatch = yield bcrypt_1.default.compare(data.password, user.password);
            if (!isPasswordMatch) {
                return { status: http_status_codes_1.default.UNAUTHORIZED, message: "Invalid Email / Password" };
            }
            const { token } = AuthMiddleware.createJWToken(data.email);
            if (!token)
                return { status: http_status_codes_1.default.NOT_IMPLEMENTED, message: "Token has not been created" };
            yield user_model_1.default.findOneAndUpdate({ email: data.email }, {
                $set: {
                    refreshToken: token.refreshToken
                }
            });
            const rabbitMQConnection = yield (0, rabbitMQ_util_1.connectToRabbitMQ)();
            if (rabbitMQConnection && rabbitMQConnection.sendToExchange) {
                const emailData = {
                    to: data.email,
                    from: process.env.EMAIL,
                    subject: "User Logged In",
                    body: `Hello ${user.name}, You have been logged in successfully`
                };
                yield rabbitMQConnection.sendToExchange(process.env.RABBITMQ_EXCHANGE, process.env.RABBITMQ_ROUTING_KEY, emailData);
            }
            else {
                return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: "Failed to connect to RabbitMQ" };
            }
            return { status: http_status_codes_1.default.OK, UserDetails: user, token: token };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.loginUser = loginUser;
const getRefreshToken = function (userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findOne({ email: userEmail });
            const refreshToken = user === null || user === void 0 ? void 0 : user.refreshToken;
            if (!refreshToken) {
                return { status: http_status_codes_1.default.NOT_FOUND, message: "Token not found" };
            }
            if (!process.env.JWT_SECERT) {
                return { status: http_status_codes_1.default.BAD_REQUEST, message: "JWT_SECRET is not defined in .env file" };
            }
            const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECERT);
            if (!payload) {
                return { status: http_status_codes_1.default.UNAUTHORIZED, message: "Token is not valid" };
            }
            const { email } = payload;
            const newToken = jsonwebtoken_1.default.sign({ email: email }, process.env.JWT_SECERT, { expiresIn: "3d" });
            return { status: http_status_codes_1.default.CREATED, message: "New Token has been created", token: newToken };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.getRefreshToken = getRefreshToken;
const getForgetPassword = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield user_model_1.default.findOne({ email: email });
            if (!data)
                return { status: http_status_codes_1.default.NOT_FOUND, message: "User Not Found" };
            const oneTimePassword = otp_generator_1.default.generate(5, { upperCaseAlphabets: false, specialChars: false });
            const subject = "Password Reset with otp";
            const message = `Your password reset otp is: ${oneTimePassword}`;
            yield (0, nodeMailer_util_1.sendEmail)({
                recipients: email,
                subject: subject,
                message: message,
            });
            return { status: http_status_codes_1.default.CREATED, message: "OTP has been sent to your email", oneTimePassword };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.getForgetPassword = getForgetPassword;
const resetPassword = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield user_model_1.default.findOneAndUpdate({ email: data.email }, {
                $set: {
                    password: data.password
                }
            });
            return { status: http_status_codes_1.default.ACCEPTED, message: "Password has been updated please login" };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.resetPassword = resetPassword;
