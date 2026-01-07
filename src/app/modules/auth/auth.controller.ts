import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { clearAuthCookies, setAuthCookie } from "../../utils/setCookie";
import { AuthService } from "./auth.service";

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
    }

    const result = await AuthService.login({ email, password });

    // Set cookies (Next.js SSR friendly)
    setAuthCookie(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
    });

    // Also return in response body (Next.js client friendly)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        }
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies");
    }

    const tokenInfo = await AuthService.getNewAccessToken(refreshTokenFromCookie);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New access token retrieved successfully",
        data: tokenInfo
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    clearAuthCookies(res);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        data: null
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const decodedToken = req.user as JwtPayload;

    if (!oldPassword || !newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Old password and new password are required");
    }

    await AuthService.changePassword(oldPassword, newPassword, decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password changed successfully",
        data: null
    });
});

export const AuthController = {
    login,
    refreshToken,
    logout,
    changePassword
};
