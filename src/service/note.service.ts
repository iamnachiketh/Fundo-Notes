import Note from "../models/note.model";
import httpStatus from "http-status-codes"
import User from "../models/user.model";
import redisClient from "../config/redis.config";
import { logger } from "../logger";
import mongoose from "mongoose";


export const createNote = async function (notes: {
    noteId: string,
    userEmail: string,
    title: string,
    desc: string,
    isArchive?: boolean,
    color?: string
}): Promise<{ status: number, message: string }> {

    try {

        let isNotePresentRedisCache = await redisClient.get(`notes:${notes.userEmail}:${notes.noteId}`);

        if (isNotePresentRedisCache) {
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }

        let isNoteAlreadyPresent = await Note.findOne({ noteId: notes.noteId });

        if (isNoteAlreadyPresent) {
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }

        let userUpdateResult = await User.findOneAndUpdate({ email: notes.userEmail }, {
            $push: {
                notesId: notes.noteId
            },
            $inc: {
                notesCount: 1
            }
        });

        if (!userUpdateResult) {
            return { status: httpStatus.NOT_FOUND, message: "User not found" };
        }

        const note = new Note({

            noteId: notes.noteId,
            userEmail: notes.userEmail,
            title: notes.title,
            desc: notes.desc,
            isArchive: notes?.isArchive,
            color: notes?.color
        })

        await note.save();

        await redisClient.set(`notes:${notes.userEmail}:${notes.noteId}`, JSON.stringify(note));

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

        if (!note) {
            return { status: httpStatus.NOT_FOUND, message: "Note not found" };
        }

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


export const getAllNotes = async function (email: string, skip: number, limit: number):
    Promise<{
        status: number,
        message?: string,
        data?: any,
        totalDocument?: number
    }> {
    try {

        const totalDocument = await Note.countDocuments({ userEmail: email });

        let notes = await redisClient.lRange(`${email}:notes`, skip, skip + limit - 1);

        logger.info(notes);

        if (notes.length !== 0) {
            let newNotes = notes.map(value => JSON.parse(value));
            return { status: httpStatus.OK, data: newNotes, totalDocument: totalDocument };
        }

        const result = await Note
            .find({ userEmail: email, isTrash: false, isArchive: false }, { _id: 0, __v: 0 })
            .skip(skip)
            .limit(limit);

        result.forEach(async value => await redisClient.lPush(`${email}:notes`, JSON.stringify(value)));

        return { status: httpStatus.OK, data: result, totalDocument: totalDocument };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message }
    }
}


export const trashNotesById = async function (noteId: string, userEmail: string):
    Promise<{
        status: number,
        message: string
    }> {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        await Note.findOneAndUpdate({ noteId: noteId }, {
            $set: {
                isTrash: true
            }
        }, { session });

        await User.findOneAndUpdate({ email: userEmail }, {
            $pull: {
                notesId: noteId
            },
            $inc: {
                notesCount: -1
            }
        }, { session });

        await redisClient.del(`${userEmail}:${noteId}`);

        await session.commitTransaction();
        session.endSession();

        return { status: httpStatus.OK, message: "Notes has been trashed" };
    } catch (error: any) {

        await session.abortTransaction();
        session.endSession();
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }

}


export const deleteNotesFromTrash = async function (noteId: string):
    Promise<{
        status: number,
        message: string
    }> {

    try {
        await Note.findOneAndDelete({ noteId: noteId, isTrash: true });

        return { status: httpStatus.GONE, message: "Note has been deleted from trash" };
    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }

}


export const updateNotes = async function (data: {
    noteId: string,
    userEmail: string,
    title?: string,
    desc?: string
}): Promise<{
    status: number,
    message: string
}> {
    try {
        let result = await Note.findOneAndUpdate({ noteId: data.noteId }, {
            $set: {
                title: data?.title,
                desc: data?.desc
            }
        }, { new: true })

        let note = await redisClient.get(`${data.userEmail}:${data.noteId}`);

        if (note) {
            let newNote = JSON.parse(note);
            if (data.title !== undefined) newNote.title = data.title;
            if (data.desc !== undefined) newNote.desc = data.desc;

            await redisClient.set(`${data.userEmail}:${data.noteId}`, JSON.stringify(newNote));

        } else {
            await redisClient.setEx(`${data.userEmail}:${data.noteId}`, 3600, JSON.stringify(result));
        }

        return { status: httpStatus.OK, message: `Note with ID ${data.noteId} has been updated.` };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }
}

export const addToArchive = async function (noteId: string, userEmail: string): Promise<{ status: number, message: string }> {

    try {

        const cachedNote = await redisClient.get(`${userEmail}:${noteId}`);

        if (cachedNote) {

            const note = JSON.parse(cachedNote);
            note.isArchive = true;

            await redisClient.setEx(`${userEmail}:${noteId}`, 3600, JSON.stringify(note));
        }

        const result = await Note.findOneAndUpdate({ noteId: noteId, isArchive: false, isTrash: false }, {
            $set: {
                isArchive: true
            }
        });

        if (!result) {
            return { status: httpStatus.NOT_FOUND, message: "Note not found or already archived." };
        }

        if (!cachedNote) {
            await redisClient.setEx(`${userEmail}:${noteId}`, 3600, JSON.stringify(result));
        }

        return { status: httpStatus.OK, message: "Note has been Archived" };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
}


