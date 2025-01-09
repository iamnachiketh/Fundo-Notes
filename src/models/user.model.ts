import mongoose, { Schema } from "mongoose";


interface IUser {

    name: string;
    email: string;
    password: string;
    profilePictureUrl: string;
    notesId: Array<String>;
    notesCount: number;
    refreshToken: string;

}


const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    profilePictureUrl: { type: String, default: "" },

    notesId: { type: Array<String>(), default: [] },

    notesCount: { type: Number, default: 0 },

    refreshToken: { type: String, default: null }
}, {
    timestamps: true
})


export default mongoose.model<IUser>("User", UserSchema);