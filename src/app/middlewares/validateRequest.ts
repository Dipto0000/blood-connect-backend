import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";

export const validateRequest = (zodSchema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Handle form data with JSON in 'data' field
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        req.body = await zodSchema.parseAsync(req.body);
        next();
    } catch (error) {
        next(error);
    }
};
