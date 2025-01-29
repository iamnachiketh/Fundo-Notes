import Note from "../models/note.model";
import httpStatus from "http-status-codes"
import User from "../models/user.model";
import redisClient from "../config/redis.config";
import mongoose from "mongoose";
import { logger } from "../logger";
import * as NoteHelper from "../helper/note.helper";


export const createNote = async function (notes: {
    noteId: string,
    userEmail: string,
    title: string,
    desc: string,
    isArchive?: boolean,
    color?: string
}): Promise<{ status: number, message: string }> {

    const session = await mongoose.startSession();
    session.startTransaction();

    const redisNoteKey = `notes:${notes.userEmail}:${notes.noteId}`;
    const redisUserNotesKey = `${notes.userEmail}:notes`;

    try {


        let isNotePresentRedisCache = await redisClient.get(redisNoteKey);
        if (isNotePresentRedisCache) {
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }


        let isNoteAlreadyPresent = await Note.findOne({ noteId: notes.noteId });
        if (isNoteAlreadyPresent) {
            return { status: httpStatus.BAD_REQUEST, message: "Note already exists" };
        }


        let userUpdateResult = await User.findOneAndUpdate(
            { email: notes.userEmail },
            {
                $push: { notesId: notes.noteId },
                $inc: { notesCount: 1 }
            }
        );
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
        });
        await note.save();


        await session.commitTransaction();
        session.endSession();


        await redisClient.set(redisNoteKey, JSON.stringify(note), { "EX": 3600 });
        await redisClient.lPush(redisUserNotesKey, JSON.stringify(note));

        return { status: httpStatus.CREATED, message: "Note has been created" };

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
};

export const getNoteById = async function (noteId: string, email: string):
    Promise<{
        status: number,
        message?: string,
        data?: any
    }> {
    const redisKey = `notes:${email}:${noteId}`;

    try {

        let noteData;
        try {
            noteData = await redisClient.get(redisKey);
        } catch (redisError: any) {
            logger.error(redisError.message);
        }

        if (noteData) {
            const parsedData = JSON.parse(noteData);

            if (parsedData.notFound) {
                return { status: httpStatus.NOT_FOUND, message: "Note not found" };
            }

            return { status: httpStatus.OK, data: parsedData };
        }

        const note = await Note.findOne({ noteId: noteId, userEmail: email }, { _id: 0, __v: 0 });

        if (!note) {

            await redisClient.setEx(redisKey, 3600, JSON.stringify({ notFound: true }));
            return { status: httpStatus.NOT_FOUND, message: "Note not found" };
        }

        await redisClient.setEx(redisKey, 3600, JSON.stringify(note));

        return { status: httpStatus.OK, data: note };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
}


export const checkNoteId = async function (noteId: String, email: string): Promise<{ value: boolean }> {
    let user = await User.findOne({ email: email });

    if (user?.notesId.includes(noteId)) {
        return { value: true };
    }

    return { value: false };
}


export const getAllNotes = async function (
    email: string,
    skip: number,
    limit: number
): Promise<{
    status: number,
    message?: string,
    data?: any,
    totalDocument?: number
}> {
    const redisUserNotesKey = `${email}:notes`;
    const redisTotalDocsKey = `${email}:totalDocuments`;

    try {

        let totalDocument;
        try {
            totalDocument = await redisClient.get(redisTotalDocsKey);
        } catch (redisError: any) {
            logger.error(redisError.message);
        }

        if (!totalDocument) {
            totalDocument = await Note.countDocuments({ userEmail: email });
            await redisClient.setEx(redisTotalDocsKey, 3600, totalDocument.toString());
        } else {
            totalDocument = parseInt(totalDocument, 10);
        }

        const listExists = await redisClient.exists(redisUserNotesKey);

        if (!listExists) {
            logger.info("Redis key does not exist; skipping update.");
        }

        let notes;
        try {
            notes = await redisClient.lRange(redisUserNotesKey, 0, -1);
        } catch (redisError: any) {
            logger.error(redisError.message);
        }

        if (notes && notes.length > 0) {

            const slicedNotes = NoteHelper.getNotesOfARange(notes, skip, limit);

            if (slicedNotes.length > 0) {

                const parsedNotes = slicedNotes.map(note => JSON.parse(note));

                return { status: httpStatus.OK, data: parsedNotes, totalDocument };

            }
        }


        let result = await Note.find(
            { userEmail: email, isTrash: false, isArchive: false },
            { _id: 0, __v: 0 }
        )
            .sort({ noteId: -1 });

        if (result.length > 0) {

            await redisClient.del(redisUserNotesKey);

            const pipeline = redisClient.multi();

            result.forEach(note => pipeline.rPush(redisUserNotesKey, JSON.stringify(note)));

            pipeline.expire(redisUserNotesKey, 3600);

            await pipeline.exec();
        }

        result = result.slice(skip, skip + limit);

        return { status: httpStatus.OK, data: result, totalDocument };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };

    }
};





export const trashNotesById = async function (
    noteId: string,
    userEmail: string
): Promise<{
    status: number,
    message: string;
}> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const noteUpdate = await Note.findOneAndUpdate(
            { noteId: noteId, isTrash: false },
            { $set: { isTrash: true } },
            { session }
        );

        if (!noteUpdate) {
            throw new Error("Note not found");
        }


        const userUpdate = await User.findOneAndUpdate(
            { email: userEmail },
            {
                $pull: { notesId: noteId },
                $inc: { notesCount: -1 },
            },
            { session }
        );

        if (!userUpdate) {
            throw new Error("User not found");
        }

        await session.commitTransaction();
        session.endSession();

        await NoteHelper.updateRedisArchiveOrTrash(noteId, userEmail);

        return { status: httpStatus.OK, message: "Note has been trashed" };
    } catch (error: any) {

        await session.abortTransaction();
        session.endSession();

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
};


export const deleteNotesFromTrash = async function (noteId: string, userEmail: string):
    Promise<{
        status: number,
        message: string
    }> {

    try {
        const response = await Note.findOneAndDelete({ noteId: noteId, isTrash: true });

        if (!response) {
            return { status: httpStatus.NOT_FOUND, message: "Note is not present/already been deleted" }
        }

        await redisClient.del(`notes:${userEmail}:${noteId}`);

        return { status: httpStatus.OK, message: "Note has been deleted from trash" };
    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }

}


export const updateNotes = async function (data: {
    noteId: string;
    userEmail: string;
    title?: string;
    desc?: string;
}): Promise<{
    status: number;
    message: string;
}> {
    try {

        const updatedNote = await Note.findOneAndUpdate(
            { noteId: data.noteId },
            {
                $set: {
                    ...(data.title && { title: data.title }),
                    ...(data.desc && { desc: data.desc }),
                },
            },
            { new: true }
        );

        if (!updatedNote) {
            return { status: httpStatus.NOT_FOUND, message: `Note with ID ${data.noteId} not found.` };
        }


        const noteKey = `notes:${data.userEmail}:${data.noteId}`;
        const noteInCache = await redisClient.get(noteKey);

        if (noteInCache) {
            const updatedCache = JSON.parse(noteInCache);
            if (data.title !== undefined) updatedCache.title = data.title;
            if (data.desc !== undefined) updatedCache.desc = data.desc;

            await redisClient.set(noteKey, JSON.stringify(updatedCache));
        } else {
            await redisClient.setEx(noteKey, 3600, JSON.stringify(updatedNote));
        }

        await NoteHelper.updateRedisCache(data);

        return { status: httpStatus.OK, message: `Note with ID ${data.noteId} has been updated.` };

    } catch (error: any) {

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
};





export const addToArchive = async function (noteId: string, userEmail: string):
    Promise<{
        status: number,
        message: string
    }> {

    const indivisualNoteKey = `notes:${userEmail}:${noteId}`;

    try {

        const result = await Note.findOneAndUpdate(
            { noteId: noteId, isArchive: false, isTrash: false },
            { $set: { isArchive: true } },
            { new: true }
        );

        if (!result) {
            return { status: httpStatus.NOT_FOUND, message: "Note not found or already archived." };
        }

        const cachedNote = await redisClient.get(indivisualNoteKey);

        if (cachedNote) {

            const note = JSON.parse(cachedNote);

            note.isArchive = true;

            await redisClient.setEx(indivisualNoteKey, 3600, JSON.stringify(note));
        } else {

            await redisClient.setEx(indivisualNoteKey, 3600, JSON.stringify(result));

        }

        await NoteHelper.updateRedisArchiveOrTrash(noteId, userEmail);

        return { status: httpStatus.OK, message: "Note has been Archived" };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
};


export const searchNote = async function (searchString: string, email: string, skip: number, limit: number) {
    try {
        const redisUserNoteKey = `${email}:notes:search`;

        const notes = await redisClient.lRange(redisUserNoteKey, 0, -1);

        if (notes.length > 0) {
            const parsedNotes = notes.map(note => JSON.parse(note));
            const searchResult = parsedNotes.filter(note => {
                return note.title.includes(searchString) || note.desc.includes(searchString);
            });

            const slicedNotes = NoteHelper.getNotesOfARange(searchResult, skip, limit);

            return { status: httpStatus.OK, data: slicedNotes, totalDocument: searchResult.length };
        }

        let result = await Note.find({
            userEmail: email,
            $or: [
                { title: { $regex: searchString, $options: "i" } },
                { desc: { $regex: searchString, $options: "i" } }
            ]
        }, { _id: 0, __v: 0 })
            .sort({ noteId: -1 });

        let totalDocument = result.length;

        if (result.length > 0) {
            await redisClient.del(redisUserNoteKey);

            const pipeline = redisClient.multi();

            result.forEach(note => pipeline.rPush(redisUserNoteKey, JSON.stringify(note)));

            pipeline.expire(redisUserNoteKey, 3600);

            await pipeline.exec();
        }

        result = result.slice(skip, skip + limit);

        return { status: httpStatus.OK, data: result, totalDocument };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }

}


export const getAllFromArchive = async function (email: string):
    Promise<{ status: number, message: string, data: any }> {
    try {
        const response = await Note.find({
            userEmail: email, isArchive: true, isTrash: false
        },
            { _id: 0, __v: 0 }
        )
            .sort({ noteId: -1 });

        if (response.length <= 0) {
            return { status: httpStatus.OK, message: "No Notes present", data: null }
        }

        return { status: httpStatus.OK, message: "List of Notes", data: response };


    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null }
    }
}

export const getAllFromTrash = async function (email: string):
    Promise<{
        status: number,
        message: string,
        data: any
    }> {
    try {
        const response = await Note
            .find({ userEmail: email, isTrash: true }, { _id: 0, __v: 0 })
            .sort({ noteId: -1 });

        if (response.length <= 0) {
            return { status: httpStatus.OK, message: "No Note in the trash", data: null };
        }

        return { status: httpStatus.OK, message: "List of the trash notes", data: response };

    } catch (error: any) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null };
    }
}

export const restoreNote = async function (noteId: string, email: string): Promise<{
    status: number,
    message: string
}> {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const response = await User.findOneAndUpdate({ email: email }, {
            $pull: {
                notesId: noteId
            },
            $inc: {
                notesCount: 1
            }
        }, { new: true })

        if (!response) {
            await session.abortTransaction();
            session.endSession();
            return { status: httpStatus.NOT_FOUND, message: "User Not Found" };
        }

        const result = await Note.findOneAndUpdate({ userEmail: email, noteId: noteId }, {
            $set: {
                isTrash: false
            }
        }, { new: true });

        if (!result) {
            await session.abortTransaction();
            session.endSession();
            return { status: httpStatus.NOT_FOUND, message: `Note with id ${noteId} does not exist` };
        }

        await session.commitTransaction();
        session.endSession();

        return { status: httpStatus.OK, message: "Note has been restored" };
    } catch (error: any) {

        await session.abortTransaction();
        session.endSession();

        return { status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message };
    }
}