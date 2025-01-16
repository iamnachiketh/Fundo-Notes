import { check, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes";
import { logger } from "../logger";

export const validateNote = [
    check("noteId")
        .isString()
        .notEmpty()
        .withMessage("Note ID is required and must be a string.")
        .isLength({ min: 1 })
        .withMessage("Note ID must be unique and non-empty."),
    check("userEmail")
        .isEmail()
        .withMessage("A valid email is required."),
    check("title")
        .isString()
        .notEmpty()
        .withMessage("Title is required and must be a string."),
    check("desc")
        .isString()
        .notEmpty()
        .withMessage("Description is required and must be a string."),
    check("isTrash")
        .optional()
        .isBoolean()
        .withMessage("isTrash must be a boolean value."),
    check("isArchive")
        .optional()
        .isBoolean()
        .withMessage("isArchive must be a boolean value."),
    check("color")
        .optional()
        .isString()
        .withMessage("Color must be a string."),
];


export const validate = function (req: Request, res: Response, next: NextFunction) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        logger.error("Model Validation Error");
        res.status(httpStatus.BAD_REQUEST).json({
            status: httpStatus.BAD_REQUEST,
            message: errors.array(),
            data: null
        });
        return
    }

    next();
};

