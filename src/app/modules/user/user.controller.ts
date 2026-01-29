import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body);

    // Set auth cookies for auto-login
    setAuthCookie(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered and logged in successfully",
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        }
    });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const decodedToken = req.user as JwtPayload;
    const payload = req.body;

    const user = await UserService.updateUser(userId, payload, decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: user
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All users retrieved successfully",
        data: users
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await UserService.getSingleUser(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User retrieved successfully",
        data: user
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserService.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile retrieved successfully",
        data: user
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    await UserService.deleteUser(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User deleted successfully",
        data: null
    });
});

export const UserController = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe,
    deleteUser
};
