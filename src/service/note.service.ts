import Note from "../models/note.model";
import httpStatus from "http-status-codes"
import User from "../models/user.model";
import redisClient from "../config/redis.config";

export const createNote = async function (notes: {
    noteId: string,
    userEmail: string,
    title: string,
    desc: string,
    isArchive?: boolean,
    color?: string
}): Promise<{ status: number, message: string }> {

    try {

        let isNotePresentRedisCache = await redisClient.get(`${notes.userEmail}:${notes.noteId}`);

        if(isNotePresentRedisCache){
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }

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

        await redisClient.setEx(`${notes.userEmail}:${notes.noteId}`, 3600, JSON.stringify(note));

        return { status: httpStatus.CREATED, message: "Note has been created" };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }

    }

}

export const getNoteById = async function (noteId: string, email: string): Promise<{ status: number, message?: string, data?: any }> {
    try {

        const noteData = await redisClient.get(`${email}:${noteId}`);

        if (noteData) {
            return { status: httpStatus.OK, data: JSON.parse(noteData) };
        }

        let note = await Note.findOne({ noteId: noteId, userEmail: email }, { _id: 0, __v: 0 });

        await redisClient.setEx(`${email}:${noteId}`, 3600, JSON.stringify(note));
        
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


export const getAllNotes = async function (email: string, skip: number, limit: number): Promise<{ status: number, message?: string, data?: any, totalDocument?: number }> {
    try {

        const totalDocument = await Note.countDocuments({ userEmail: email });

        let notes = await redisClient.get(`${email}:notes`);

        if (notes) {
            return { status: httpStatus.OK, data: JSON.parse(notes),  totalDocument: totalDocument};
        }

        const result = await Note
            .find({ userEmail: email, isTrash: false, isArchive: false }, { _id: 0, __v: 0 })
            .skip(skip)
            .limit(limit);

        

        // This is another way of getting the list of notes

        // let result: Array<any> = [];

        // let totalNumberOfNotes = user?.notesId.length === undefined ? 0 : user?.notesId.length;

        // for (let i = 0; i < totalNumberOfNotes; i++) {
        //     let response = await Note.findOne({ noteId: user?.notesId[i] }, { _id: 0, __v: 0 });
        //     result.push(response);
        // }

        // if (result.length === 0) return { status: httpStatus.OK, message: "No Note is created yet" };

        await redisClient.setEx(`${email}:notes`, 3600, JSON.stringify(result));

        return { status: httpStatus.OK, data: result, totalDocument: totalDocument };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}


export const trashNotesById = async function (noteId: string, userEmail: string): Promise<{ status: number, message: string }> {

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

        return { status: httpStatus.OK, message: "Notes has been trashed" };
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


export const updateNotes = async function (data: {
    noteId: string,
    title?: string,
    desc?: string
}): Promise<{ status: number, message: string }> {
    try {
        await Note.findOneAndUpdate({ noteId: data.noteId }, {
            $set: {
                title: data?.title,
                desc: data?.desc
            }
        })
        return { status: httpStatus.OK, message: "Note has been updated" };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }
}


export const addToArchive = async function (noteId: string): Promise<{ status: number, message: string }> {

    try {
        await Note.findOneAndUpdate({ noteId: noteId, isArchive: false }, {
            $set: {
                isArchive: true
            }
        });

        return { status: httpStatus.OK, message: "Note has been Archived" };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
}


