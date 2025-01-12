import userRouter from "../routes/user.router";
import noteRouter from "../routes/note.router";
import { Router } from "express";
import swaggerUI from "swagger-ui-express";
import swaggerDoc from "../swagger/swagger.json";



export const handleRouter = function (): Router {
    const router = Router();

    router.use("/users", userRouter);

    router.use("/notes", noteRouter);

    router.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));

    return router;
}

