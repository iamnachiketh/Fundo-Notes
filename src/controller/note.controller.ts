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