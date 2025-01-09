import User from "../models/user.model";
import httpStatus from "http-status-codes";
import { userSchemaValidation } from "../schemaValidation/user.validation";
import bcrypt from "bcrypt";


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
            profilePictureUrl: userData.profilePictureUrl
        });

        await user.save();

        return { status: httpStatus.CREATED, message: "User registered successfully" }

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}





export const loginUser = async function (data: {
    email: string,
    password: string
}): Promise<{ status: number, message?: string, UserDetails?: any }> {

    try {
        const user = await User.findOne({ email: data.email }, { _id: 0, __v: 0 })

        if (!user) {
            return { status: httpStatus.NOT_FOUND, message: "User not found" }
        }

        const isPasswordMatch = await bcrypt.compare(data.password, user.password);

        if (!isPasswordMatch) {
            return { status: httpStatus.UNAUTHORIZED, message: "Invalid Email / Password" }
        }

        return { status: httpStatus.OK, UserDetails: user };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }

    }
}