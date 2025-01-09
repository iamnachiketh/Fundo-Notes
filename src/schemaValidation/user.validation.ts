import Joi from "joi";

export const userSchemaValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    profilePictureUrl: Joi.string()
})