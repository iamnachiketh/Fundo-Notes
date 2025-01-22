import User from "../models/user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcrypt";
import * as AuthMiddleware from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import otp from "otp-generator";
import { userSchemaValidation } from "../schemaValidation/user.validation";
import { sendEmail } from "../util/nodeMailer.util";
import { connectToRabbitMQ } from "../util/rabbitMQ.util";




export const registerUser = async function (userData: {
    name: string,
    email: string,
    password: string,
    profilePictureUrl: string
}): Promise<{ status: number, message: string }> {

    try {

        const isUserPresent = await User
            .findOne()
            .where("email")
            .equals(userData.email);

        if (isUserPresent) {
            return { status: httpStatus.CONFLICT, message: "User already exists" }
        }

        const { error } = await userSchemaValidation.validateAsync(userData);

        if (error) {
            return { status: httpStatus.BAD_REQUEST, message: error.message }
        }


        const user = new User({

            name: userData.name,
            email: userData.email,
            password: userData.password,
            profilePictureUrl: userData.profilePictureUrl,
        });

        await user.save();

        const emailData = {
            to: userData.email,
            from: process.env.USER_EMAIL as string,
            subject: "User Registered",
            body: `Hello ${userData.name}, You have been registered successfully`
        }

        const rabbitMQConnection = await connectToRabbitMQ();

        if (rabbitMQConnection && rabbitMQConnection.sendToExchange) {

            await rabbitMQConnection.sendToExchange(
                process.env.RABBITMQ_EXCHANGE as string,
                process.env.RABBITMQ_ROUTING_KEY as string,
                emailData
            );

        } else {
            return { status: httpStatus.INTERNAL_SERVER_ERROR, message: "Failed to connect to RabbitMQ" };
        }

        return { status: httpStatus.CREATED, message: "User registered successfully" }

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}





export const loginUser = async function (data: {
    email: string,
    password: string
}): Promise<{
    status: number,
    message?: string,
    UserDetails?: any,
    token?: {
        accessToken: string,
        refreshToken: string
    }
}> {

    try {
        const user = await User.findOne({ email: data.email }, { _id: 0, __v: 0 })

        if (!user) {
            return { status: httpStatus.NOT_FOUND, message: "User not found" }
        }

        const isPasswordMatch = await bcrypt.compare(data.password, user.password);

        if (!isPasswordMatch) {
            return { status: httpStatus.UNAUTHORIZED, message: "Invalid Email / Password" }
        }

        const { token } = AuthMiddleware.createJWToken(data.email);

        if (!token)
            return { status: httpStatus.NOT_IMPLEMENTED, message: "Token has not been created" };

        await User.findOneAndUpdate({ email: data.email }, {
            $set: {
                refreshToken: token.refreshToken
            }
        });

        const rabbitMQConnection = await connectToRabbitMQ();

        if (rabbitMQConnection && rabbitMQConnection.sendToExchange) {

            const emailData = {

                to: data.email,
                from: process.env.EMAIL as string,
                subject: "User Logged In",
                body: `Hello ${user.name}, You have been logged in successfully`

            }

            await rabbitMQConnection.sendToExchange(
                process.env.RABBITMQ_EXCHANGE as string,
                process.env.RABBITMQ_ROUTING_KEY as string,
                emailData
            );

        } else {
            return { status: httpStatus.INTERNAL_SERVER_ERROR, message: "Failed to connect to RabbitMQ" };
        }

        return { status: httpStatus.OK, UserDetails: user, token: token };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }

    }
}

export const getRefreshToken = async function (userEmail: string): Promise<{
    status: number,
    message: string,
    token?: string
}> {
    try {
        const user = await User.findOne({ email: userEmail });

        const refreshToken = user?.refreshToken;

        if (!refreshToken) {
            return { status: httpStatus.NOT_FOUND, message: "Token not found" };
        }

        if (!process.env.JWT_SECERT) {
            return { status: httpStatus.BAD_REQUEST, message: "JWT_SECRET is not defined in .env file" };
        }

        const payload: any = jwt.verify(refreshToken, process.env.JWT_SECERT as string);

        if (!payload) {
            return { status: httpStatus.UNAUTHORIZED, message: "Token is not valid" }
        }

        const { email } = payload;

        const newToken = jwt.sign({ email: email }, process.env.JWT_SECERT as string, { expiresIn: "3d" });

        return { status: httpStatus.CREATED, message: "New Token has been created", token: newToken };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}


export const getForgetPassword = async function (email: string): Promise<{
    status: number,
    message: string,
    oneTimePassword?: string
}> {
    try {
        const data = await User.findOne({ email: email });

        if (!data)
            return { status: httpStatus.NOT_FOUND, message: "User Not Found" };

        const oneTimePassword = otp.generate(5, { upperCaseAlphabets: false, specialChars: false });

        const subject = "Password Reset with otp";
        const message = `Your password reset otp is: ${oneTimePassword}`;

        await sendEmail({
            recipients: email,
            subject: subject,
            message: message,
        });

        return { status: httpStatus.CREATED, message: "OTP has been sent to your email", oneTimePassword }

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }
}


export const resetPassword = async function (data: { email: string, password: string }): Promise<{
    status: number,
    message: string
}> {
    try {
        await User.findOneAndUpdate({ email: data.email }, {
            $set: {
                password: data.password
            }
        });

        return { status: httpStatus.ACCEPTED, message: "Password has been updated please login" }

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
}


