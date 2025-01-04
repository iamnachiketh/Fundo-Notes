import User from "../models/user.model";
import httpStatus from "http-status-codes";
import { userSchemaValidation } from "../schemaValidation/user.validation";
import bcrypt from "bcrypt";


export const registerUser = async function (userData: {
    name: string,
    email: string,
    password: string,
    profilePictureUrl: string,
    notesId: Array<String>,
    notesCount: number
}): Promise<{ status: number, message: string }> {

    try {

        const { error } = await userSchemaValidation.validateAsync(userData);

        if (error) {
            return { status: httpStatus.BAD_REQUEST, message: error.message }
        }


        const user = new User({

            name: userData.name,
            email: userData.email,
            password: userData.password,
            profilePictureUrl: userData.profilePictureUrl,
            notesId: userData.notesId,
            notesCount: userData.notesCount

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
        const user = await User.findOne({email:data.email},{ _id: 0, __v: 0 })

        if (!user) {
            return { status: httpStatus.NOT_FOUND, message: "User not found" }
        }

        const isPasswordMatch = await bcrypt.compare(data.password, user.password);

        if (!isPasswordMatch) {
            return { status: httpStatus.UNAUTHORIZED, message: "Invalid Email / Password" }
        }
        console.log(user);
        return { status: httpStatus.OK, UserDetails: user };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }

    }
}