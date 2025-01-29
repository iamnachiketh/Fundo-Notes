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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResetPassword = exports.handleGetForgetPassword = exports.handleOtp = exports.handleGetRefreshToken = exports.handleLoginUser = exports.handleRegisterUser = void 0;
const UserService = __importStar(require("../service/user.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const handleRegisterUser = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        try {
            const hash = yield bcrypt_1.default.hash(data.password, 10);
            data.password = hash;
            const response = yield UserService.registerUser(data);
            res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({ status: http_status_codes_1.default.INTERNAL_SERVER_ERROR, message: error.message, data: null });
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
    });
};
exports.handleRegisterUser = handleRegisterUser;
const handleLoginUser = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const data = req.body;
        try {
            const response = yield UserService.loginUser(data);
            if (response.message === undefined) {
                const _c = response.UserDetails, { refreshToken } = _c, newUserData = __rest(_c, ["refreshToken"]);
                res.status(response.status).json({
                    status: response.status,
                    message: "User logged in successfully",
                    data: newUserData,
                    accessToken: (_a = response.token) === null || _a === void 0 ? void 0 : _a.accessToken,
                    refreshToken: (_b = response.token) === null || _b === void 0 ? void 0 : _b.refreshToken
                });
            }
            else
                res.status(response.status).json({ status: response.status, message: response.message, data: null });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleLoginUser = handleLoginUser;
const handleGetRefreshToken = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _a = req.body, { payload } = _a, data = __rest(_a, ["payload"]);
            if (data.email !== payload.email) {
                res.status(http_status_codes_1.default.UNAUTHORIZED).json({ status: http_status_codes_1.default.UNAUTHORIZED, message: "Invalid User", data: null });
                return;
            }
            const response = yield UserService.getRefreshToken(data.email);
            res.status(response.status).json({
                status: response.status,
                message: response.message,
                token: response.token
            });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR)
                .json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetRefreshToken = handleGetRefreshToken;
const otpGetterSetter = function () {
    let _oneTimePassword;
    return {
        setOneTimePassword: function (otp) {
            _oneTimePassword = otp;
        },
        getOneTimePassword: function () {
            return _oneTimePassword;
        }
    };
};
const handleGetForgetPassword = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email;
            if (!email) {
                res.status(http_status_codes_1.default.BAD_REQUEST).json({
                    status: http_status_codes_1.default.BAD_REQUEST,
                    message: "Please Enter the email",
                    data: null
                });
            }
            const response = yield UserService.getForgetPassword(email);
            if (!response.oneTimePassword) {
                res.status(response.status).json({
                    status: response.status,
                    message: response.message,
                    data: null
                });
                return;
            }
            const oneTimePassword = response.oneTimePassword;
            exports.handleOtp = otpGetterSetter();
            exports.handleOtp.setOneTimePassword(oneTimePassword);
            res.status(response.status).json({
                status: response.status,
                message: response.message,
                otp: exports.handleOtp.getOneTimePassword(),
                data: null
            });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleGetForgetPassword = handleGetForgetPassword;
const handleResetPassword = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            data.password = yield bcrypt_1.default.hash(data.password, 10);
            const response = yield UserService.resetPassword(data);
            res.status(response.status).json({
                status: response.status,
                message: response.message,
                data: null
            });
        }
        catch (error) {
            res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                status: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null
            });
        }
    });
};
exports.handleResetPassword = handleResetPassword;
