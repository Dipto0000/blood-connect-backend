import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Role } from "../user/user.interface";
import { PostService } from "./post.service";

// Public - Get all open posts
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const posts = await PostService.findAllOpen();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Posts retrieved successfully",
        data: posts
    });
});

// Public - Get single post
const getPostById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await PostService.findById(id);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post retrieved successfully",
        data: post
    });
});

// Protected - Create post (seeker)
const createPost = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const post = await PostService.createPost(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Blood request post created successfully",
        data: post
    });
});

// Protected - Update post (owner or admin)
const updatePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const post = await PostService.findById(id);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    // Check ownership or admin
    if (post.seeker.toString() !== userId && userRole !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Not authorized to update this post");
    }

    const updatedPost = await PostService.updateById(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post updated successfully",
        data: updatedPost
    });
});

// Protected - Delete post (owner or admin can delete any)
const deletePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const post = await PostService.findById(id);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    // Admin can delete any post, users can only delete their own
    if (post.seeker.toString() !== userId && userRole !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "Not authorized to delete this post");
    }

    await PostService.deleteById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post deleted successfully",
        data: null
    });
});

// Protected - Mark as going
const markGoing = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await PostService.addGoingUser(id, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Marked as going successfully",
        data: post
    });
});

// Protected - Remove going
const removeGoing = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await PostService.removeGoingUser(id, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Removed from going list",
        data: post
    });
});

// Protected - Mark as interested
const markInterested = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await PostService.addInterestedUser(id, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Marked as interested successfully",
        data: post
    });
});

// Protected - Remove interested
const removeInterested = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await PostService.removeInterestedUser(id, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Removed from interested list",
        data: post
    });
});

// Protected - Give lift (rider)
const giveLift = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { donorId } = req.body;
    const riderId = req.user?.userId;

    if (!donorId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Donor ID is required");
    }

    const post = await PostService.addLiftConnection(id, riderId, donorId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Lift offered successfully",
        data: post
    });
});

// Protected - Cancel lift
const cancelLift = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { donorId } = req.body;
    const riderId = req.user?.userId;

    if (!donorId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Donor ID is required");
    }

    const post = await PostService.removeLiftConnection(id, riderId, donorId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Lift offer cancelled",
        data: post
    });
});

// Protected - Get my posts
const getMyPosts = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload)?.userId;
    const posts = await PostService.findBySeeker(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your posts retrieved successfully",
        data: posts
    });
});

export const PostController = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    markGoing,
    removeGoing,
    markInterested,
    removeInterested,
    giveLift,
    cancelLift,
    getMyPosts
};
