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


export const handleGetNoteById = async function(req:Request,res:Response){
    try{
        const { payload, ...data } = req.body;

        const noteId = req.params.id;

        if (data.userEmail !== payload.email || !await NoteService.checkNoteId(noteId,data.userEmail as string)) {
            res.status(httpStatus.NOT_FOUND).json({ status: httpStatus.NOT_FOUND, message: "Invalid User/Note dosent exists", data: null });
            return;
        }

        const response = await NoteService.getNoteById(noteId);

        if(response.message === undefined)
            res.status(response.status).json({status:response.status,message:"Data has been created",data:response.data});
        else
            res.status(response.status).json({status:response.status,message:response.message,data:null});


    }catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ status: httpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null });
    }
}


export const handleGetAllNotesOfAUser = async function(req:Request,res:Response){
    try{
        const { payload, ...data } = req.body;

        if (data.userEmail !== payload.email) {
            res.status(httpStatus.FORBIDDEN).json({ status: httpStatus.FORBIDDEN, message: "Invalid User", data: null });
            return;
        }

        const response = await NoteService.getAllNotes(data.userEmail);

        if(response.message === undefined) 
            res.status(response.status).json({ status: httpStatus.OK, message: "List of Notes", data: response.data });
        else 
            res.status(response.status).json({status: httpStatus.OK, message: response.message, data: null})

    }catch(error:any){
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({status:httpStatus.INTERNAL_SERVER_ERROR,message:error.message,data:null})
    }
}