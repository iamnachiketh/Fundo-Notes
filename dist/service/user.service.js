"use strict";
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
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_validation_1 = require("../schemaValidation/user.validation");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
                profilePictureUrl: userData.profilePictureUrl
            });
            yield user.save();
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
            return { status: http_status_codes_1.default.OK, UserDetails: user };
        }
        catch (error) {
            return { status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message };
        }
    });
};
exports.loginUser = loginUser;
