import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            throw new AppError(httpStatus.FORBIDDEN, "No Token Received");
        }

        const accessToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
        }
        if (!isUserExist.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
        }
        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to access this route!");
        }

        req.user = verifiedToken;
        next();
    } catch (error) {
        console.log("jwt error", error);
        next(error);
    }
};
