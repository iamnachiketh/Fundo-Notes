import express from "express";
import * as NoteController from "../controller/note.controller";
import * as AuthMiddleware from "../middleware/auth.middleware";
import * as NoteValidate from "../schemaValidation/note.validation";


const router = express.Router();

router.post("/", NoteValidate.validateNote, NoteValidate.validate, AuthMiddleware.verifyToken, NoteController.handleCreateNote);

router.get("/:id", AuthMiddleware.verifyToken, NoteController.handleGetNoteById);

router.get("/", AuthMiddleware.verifyToken, NoteController.handleGetAllNotesOfAUser);

router.get("/note-search/search", AuthMiddleware.verifyToken, NoteController.handleSearchNotes);

router.put("/:id", AuthMiddleware.verifyToken, NoteController.handleUpdateNotes);

router.put("/:id/trash", AuthMiddleware.verifyToken, NoteController.handleTrashById);

router.put("/:id/archive", AuthMiddleware.verifyToken, NoteController.handleAddToArchive);

router.delete("/:id/delete", AuthMiddleware.verifyToken, NoteController.handleDeleteNotesFromTrash);



export default router;
