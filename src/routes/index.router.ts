import userRouter from "../routes/user.router";
import noteRouter from "../routes/note.router";
import { Router } from "express";


export const handleRouter = function (): Router {
    const router = Router();

    router.use("/users", userRouter);

    router.use("/notes", noteRouter);

    return router;
}

