import { Types } from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IPost } from "./post.interface";
import { Post } from "./post.model";

const createPost = async (seekerId: string, postData: Partial<IPost>): Promise<IPost> => {
    const post = await Post.create({
        seeker: new Types.ObjectId(seekerId),
        ...postData,
        interactions: {
            going: [],
            interested: [],
            givingLift: []
        }
    });

    return post;
};

const findAllOpen = async (): Promise<IPost[]> => {
    return Post.find({ status: "open" })
        .populate("seeker", "name phone")
        .populate("interactions.going", "name phone bloodGroup")
        .populate("interactions.interested", "name phone bloodGroup")
        .populate("interactions.givingLift.rider", "name phone")
        .populate("interactions.givingLift.donor", "name phone bloodGroup")
        .sort({ createdAt: -1 });
};

const findById = async (id: string): Promise<IPost | null> => {
    return Post.findById(id)
        .populate("seeker", "name phone")
        .populate("interactions.going", "name phone bloodGroup")
        .populate("interactions.interested", "name phone bloodGroup")
        .populate("interactions.givingLift.rider", "name phone")
        .populate("interactions.givingLift.donor", "name phone bloodGroup");
};

const findBySeeker = async (seekerId: string): Promise<IPost[]> => {
    return Post.find({ seeker: new Types.ObjectId(seekerId) })
        .sort({ createdAt: -1 });
};

const updateById = async (id: string, updateData: Partial<IPost>): Promise<IPost | null> => {
    return Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteById = async (id: string): Promise<IPost | null> => {
    return Post.findByIdAndDelete(id);
};

const addGoingUser = async (postId: string, userId: string): Promise<IPost | null> => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    // Check if already in going list
    if (post.interactions.going.some(id => id.toString() === userId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Already marked as going");
    }

    return Post.findByIdAndUpdate(
        postId,
        { $addToSet: { "interactions.going": new Types.ObjectId(userId) } },
        { new: true }
    );
};

const removeGoingUser = async (postId: string, userId: string): Promise<IPost | null> => {
    return Post.findByIdAndUpdate(
        postId,
        { $pull: { "interactions.going": new Types.ObjectId(userId) } },
        { new: true }
    );
};

const addInterestedUser = async (postId: string, userId: string): Promise<IPost | null> => {
    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    if (post.interactions.interested.some(id => id.toString() === userId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Already marked as interested");
    }

    return Post.findByIdAndUpdate(
        postId,
        { $addToSet: { "interactions.interested": new Types.ObjectId(userId) } },
        { new: true }
    );
};

const removeInterestedUser = async (postId: string, userId: string): Promise<IPost | null> => {
    return Post.findByIdAndUpdate(
        postId,
        { $pull: { "interactions.interested": new Types.ObjectId(userId) } },
        { new: true }
    );
};

const addLiftConnection = async (postId: string, riderId: string, donorId: string): Promise<IPost | null> => {
    return Post.findByIdAndUpdate(
        postId,
        {
            $push: {
                "interactions.givingLift": {
                    rider: new Types.ObjectId(riderId),
                    donor: new Types.ObjectId(donorId)
                }
            }
        },
        { new: true }
    );
};

const removeLiftConnection = async (postId: string, riderId: string, donorId: string): Promise<IPost | null> => {
    return Post.findByIdAndUpdate(
        postId,
        {
            $pull: {
                "interactions.givingLift": {
                    rider: new Types.ObjectId(riderId),
                    donor: new Types.ObjectId(donorId)
                }
            }
        },
        { new: true }
    );
};

export const PostService = {
    createPost,
    findAllOpen,
    findById,
    findBySeeker,
    updateById,
    deleteById,
    addGoingUser,
    removeGoingUser,
    addInterestedUser,
    removeInterestedUser,
    addLiftConnection,
    removeLiftConnection
};
