import redisClient from "../config/redis.config";
import { logger } from "../logger";


export const getNotesOfARange = function (notes: any[], skip: number, limit: number): string[] {
    return notes.slice(skip, skip + limit);
};




export const updateRedisCache = async function (data: {
    noteId: string;
    userEmail: string;
    title?: string;
    desc?: string;
}) {
    const listKey = `${data.userEmail}:notes`;

    try {
        const notes = await redisClient.lRange(listKey, 0, -1);

        if (notes && notes.length > 0) {

            const updatedNotes = notes.map(note => {

                const parsedNote = JSON.parse(note);

                if (parsedNote.noteId === data.noteId) {

                    if (data.title !== undefined) parsedNote.title = data.title;

                    if (data.desc !== undefined) parsedNote.desc = data.desc;

                }

                return JSON.stringify(parsedNote);

            });


            const pipeline = redisClient.multi();

            await redisClient.del(listKey);

            updatedNotes.forEach(note => pipeline.rPush(listKey, note));

            pipeline.expire(listKey, 3600);

            await pipeline.exec();

        }

    } catch (error: any) {

        logger.error(error.message);

    }
};





export const updateRedisArchiveOrTrash = async function (noteId: string, userEmail: string) {
    const redisKey = `${userEmail}:notes`;

    try {

        const listExists = await redisClient.exists(redisKey);

        if (!listExists) {
            logger.error("Redis key does not exist; skipping update.");
            return;
        }


        const notes = await redisClient.lRange(redisKey, 0, -1);
        const filteredNotes = notes.filter(note => JSON.parse(note).noteId !== noteId);

        await redisClient.del(redisKey);

        if (filteredNotes.length > 0) {

            const pipeline = redisClient.multi();

            filteredNotes.forEach(note => pipeline.rPush(redisKey, note));

            pipeline.expire(redisKey, 3600);

            await pipeline.exec();

        }
    } catch (error: any) {
        logger.error(error.message);
    }
};


export const updateRedisUnarchiveOrRestore = async function (userEmail: string, data: any) {

    const redisNoteListKey = `${userEmail}:notes`;

    try {
        const keyExists = await redisClient.exists(redisNoteListKey);

        if (!keyExists) {
            logger.info("Note list Key dosent exists");
            return;
        }

        const noteList = await redisClient.lRange(redisNoteListKey, 0, -1);

        if (noteList && noteList.length > 0) {

            await redisClient.del(redisNoteListKey);

            noteList.push(JSON.stringify(data));

            const pipline = redisClient.multi();

            noteList.forEach((value) => pipline.rPush(redisNoteListKey, value));

            pipline.expire(redisNoteListKey, 3600);

            await pipline.exec();

            logger.info("Redis for unarchive/restore has been updated");
        }

    } catch (error: any) {
        logger.error(error.message);
    }
}

