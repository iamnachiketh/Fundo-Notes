import Note from "../models/note.model";
import httpStatus from "http-status-codes"
import User from "../models/user.model";

export const createNote = async function (notes: {
    noteId: string,
    userEmail: string,
    title: string,
    desc: string,
    isArchive?: boolean,
    color?: string
}): Promise<{ status: number, message: string }> {

    try {

        let isNoteAlreadyPresent = await Note.findOne({ noteId: notes.noteId });

        if (isNoteAlreadyPresent) {
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }

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
            desc: notes.desc,
            isArchive: notes?.isArchive,
            color: notes?.color
        })

        await note.save();

        return { status: httpStatus.CREATED, message: "Note has been created" };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }

    }

}

export const getNoteById = async function (noteId: string): Promise<{ status: number, message?: string, data?: any }> {
    try {
        let note = await Note.findOne({ noteId: noteId }, { _id: 0, __v: 0 });

        return { status: httpStatus.OK, data: note }

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}


export const checkNoteId = async function (noteId: String, email: string): Promise<{ value: boolean }> {
    let user = await User.findOne({ email: email });

    if (user?.notesId.includes(noteId)) {
        return { value: true };
    }

    return { value: false };
}


export const getAllNotes = async function (email: string): Promise<{ status: number, message?: string, data?: any }> {
    try {

        const result = await Note.find({ userEmail: email, isTrash: false }, { _id: 0, __v: 0 });

        // This is another way of getting the list of notes

        // let result: Array<any> = [];

        // let totalNumberOfNotes = user?.notesId.length === undefined ? 0 : user?.notesId.length;

        // for (let i = 0; i < totalNumberOfNotes; i++) {
        //     let response = await Note.findOne({ noteId: user?.notesId[i] }, { _id: 0, __v: 0 });
        //     result.push(response);
        // }

        // if (result.length === 0) return { status: httpStatus.OK, message: "No Note is created yet" };

        return { status: httpStatus.OK, data: result };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}


export const deleteNotesById = async function (noteId: string, userEmail: string): Promise<{ status: number, message: string }> {

    try {
        await Note.findOneAndUpdate({ noteId: noteId }, {
            $set: {
                isTrash: true
            }
        });

        await User.findOneAndUpdate({ email: userEmail }, {
            $pull: {
                notesId: noteId
            },
            $inc: {
                notesCount: -1
            }
        })

        return { status: httpStatus.OK, message: "Notes has been deleted" };
    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }

}


export const deleteNotesFromTrash = async function (noteId: string): Promise<{ status: number, message: string }> {

    try {
        await Note.findOneAndDelete({ noteId: noteId, isTrash: true });

        return { status: httpStatus.GONE, message: "Note has been deleted from trash" };
    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }

}


