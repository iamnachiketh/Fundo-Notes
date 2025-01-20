import * as NoteService from "../service/note.service";
import { Request, Response } from "express";
import httpStatus from "http-status-codes";

export const handleCreateNote = async function (req: Request, res: Response) {
    try {
        const { payload, ...data } = req.body;

        if (data.userEmail !== payload.email) {
            res.status(httpStatus.FORBIDDEN).json({ status: httpStatus.FORBIDDEN, message: "Invalid User", data: null });
            return;
        }

        const response = await NoteService.createNote(data);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    }
}


export const handleGetNoteById = async function (req: Request, res: Response) {
    try {
        const { payload, ...data } = req.body;

        const noteId = req.params.id;

        if (data.userEmail !== payload.email || !(await NoteService.checkNoteId(noteId, data.userEmail as string)).value) {
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
            return;
        }

        const response = await NoteService.getNoteById(noteId, data.userEmail);

        if (response.message === undefined)
            res.status(response.status).json({ status: response.status, message: "Data has been fetched", data: response.data });
        else
            res.status(response.status).json({ status: response.status, message: response.message, data: null });


    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    }
}


export const handleGetAllNotesOfAUser = async function (req: Request, res: Response) {
    try {
        const { payload, ...data } = req.body;

        if (data.userEmail !== payload.email) {
            res.status(httpStatus.FORBIDDEN).json({ status: httpStatus.FORBIDDEN, message: "Invalid User", data: null });
            return;
        }

        const page = Number(req.query.page as string) || 1;

        const limit = Number(req.query.limit as string) || 5;

        if (page <= 0 || limit <= 0) {
            res.status(httpStatus.BAD_REQUEST).json({ status: httpStatus.BAD_REQUEST, message: "Page and limit must be positive integer", data: null });
            return;
        }

        const skip = (page - 1) * limit;

        const response = await NoteService.getAllNotes(data.userEmail, skip, limit);

        const docCount = response.totalDocument === undefined ? 0 : response.totalDocument;

        const totalPages = Math.ceil(docCount / limit);

        if (response.message === undefined)
            res.status(response.status).json({
                status: httpStatus.OK,
                message: "List of Notes",
                data: response.data,
                meta: {
                    page,
                    limit,
                    docCount,
                    totalPages
                }
            });
        else
            res.status(response.status).json({ status: httpStatus.OK, message: response.message, data: null })

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null })
    }
}


export const handleTrashById = async function (req: Request, res: Response) {

    try {
        const { payload, ...data } = req.body;

        const noteId = req.params.id;

        if (data.userEmail !== payload.email || !(await NoteService.checkNoteId(noteId, data.userEmail as string)).value) {
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
            return;
        }

        let response = await NoteService.trashNotesById(noteId, data.userEmail);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });

    }
}


export const handleDeleteNotesFromTrash = async function (req: Request, res: Response) {
    try {
        const { payload, ...data } = req.body;

        const noteId = req.params.id;

        if (data.userEmail !== payload.email) {
            res.status(httpStatus.FORBIDDEN).json({ status: httpStatus.FORBIDDEN, message: "Invalid User", data: null });
            return;
        }

        const response = await NoteService.deleteNotesFromTrash(noteId);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INSUFFICIENT_SPACE_ON_RESOURCE, message: error.message, data: null });
    }
}


export const handleUpdateNotes = async function (req: Request, res: Response) {
    try {
        const { payload, ...data } = req.body;

        const noteId = req.body.noteId;

        if (data.userEmail !== payload.email || !(await NoteService.checkNoteId(noteId, data.userEmail as string)).value) {
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
            return;
        }

        const response = await NoteService.updateNotes(noteId);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });

    }
}


export const handleAddToArchive = async function (req: Request, res: Response) {

    try {
        const { payload, ...data } = req.body;

        const noteId = req.body.noteId;

        if (data.userEmail !== payload.email || !(await NoteService.checkNoteId(noteId, data.userEmail as string)).value) {
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
            return;
        }

        const response = await NoteService.addToArchive(noteId);

        res.status(response.status).json({ status: response.status, message: response.message, data: null });

    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    }
}