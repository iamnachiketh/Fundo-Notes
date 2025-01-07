import express from "express";
import * as NoteController from "../controller/note.controller";
import * as AuthMiddleware from "../middleware/auth.middleware";
import * as NoteValidate from "../schemaValidation/note.validation";
import { body } from "express-validator";


const router = express.Router();

router.post("/create-note",
    body('noteId').notEmpty().isString(),
    body('userEmail').notEmpty().isString(),
    body('title').notEmpty().isString(),
    body('desc').notEmpty().isString(),
    AuthMiddleware.verifyToken,
    NoteController.handleCreateNote
);







export default router;
