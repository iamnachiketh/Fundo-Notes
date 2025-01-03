import User from "../models/user.model";
import httpStatus from "http-status-codes";
import { userSchemaValidation } from "../schemaValidation/user.validation";


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