import Note from "../models/note.model";
import httpStatus from "http-status-codes"
import User from "../models/user.model";

export const createNote = async function (notes: {
    noteId: string,
    userEmail: string,
    title: string,
    desc: string
}): Promise<{ status: number, message: string }> {

    try {

        await User.findOneAndUpdate({ email: notes.userEmail }, {
            $push: {
                notesId: notes.noteId
            },
            $inc: {
                notesCount: 1
            }
        });

        const note = new Note({

            noteId: notes.noteId,
            userEmail: notes.userEmail,
            title: notes.title,
            desc: notes.desc
        })

        await note.save();

        return { status: httpStatus.CREATED, message: "Note has been created" };

    } catch (error: any) {
        
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    
    }





}
