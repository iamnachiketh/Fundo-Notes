import { body } from "express-validator";

export const validateNote = function(){

    body('noteId').notEmpty().isString(),
    body('userEmail').notEmpty().isString(),
    body('title').notEmpty().isString(),
    body('desc').notEmpty().isString(),
    body('isTrash').isBoolean(),
    body('isArchive').isBoolean()

} 



