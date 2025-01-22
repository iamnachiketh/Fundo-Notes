import redisClient from "../config/redis.config";
import { logger } from "../logger";


export const getNotesOfARange = function (notes: string[], skip: number, limit: number): string[] {
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
    const individualNoteKey = `notes:${userEmail}:${noteId}`;

    try {

        await redisClient.del(individualNoteKey);


        const listExists = await redisClient.exists(redisKey);

        if (!listExists) {
            logger.error("Redis key does not exist; skipping update.");
            return;
        }


        const notes = await redisClient.lRange(redisKey, 0, -1);
        const filteredNotes = notes.filter(note => JSON.parse(note).noteId !== noteId);


        if (filteredNotes.length > 0) {

            const pipeline = redisClient.multi();

            await redisClient.del(redisKey);

            filteredNotes.forEach(note => pipeline.rPush(redisKey, note));

            pipeline.expire(redisKey, 3600);

            await pipeline.exec();

        } else {

            await redisClient.del(redisKey);

        }
    } catch (error: any) {
        logger.error(error.message);
    }
};

