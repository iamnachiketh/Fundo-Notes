import express from "express";
import * as NoteController from "../controller/note.controller";
import * as AuthMiddleware from "../middleware/auth.middleware";
import * as NoteValidate from "../schemaValidation/note.validation";
import { body } from "express-validator";


const router = express.Router();

router.post("/",
    body('noteId').notEmpty().isString(),
    body('userEmail').notEmpty().isString(),
    body('title').notEmpty().isString(),
    body('desc').notEmpty().isString(),
    AuthMiddleware.verifyToken,
    NoteController.handleCreateNote
);


router.get("/:id", AuthMiddleware.verifyToken, NoteController.handleGetNoteById);

router.get("/", AuthMiddleware.verifyToken, NoteController.handleGetAllNotesOfAUser);

router.put("/:id", AuthMiddleware.verifyToken, NoteController.handleUpdateNotes);

router.put("/:id/delete", AuthMiddleware.verifyToken, NoteController.handleDeleteById);

router.put('/:noteId/archive', AuthMiddleware.verifyToken, NoteController.handleAddToArchive);

router.delete("/:id/trash", AuthMiddleware.verifyToken, NoteController.handleDeleteNotesFromTrash);


export default router;
