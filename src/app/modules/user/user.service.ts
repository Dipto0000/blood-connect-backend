import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

    const user = await User.create({
        email,
        password: hashedPassword,
        ...rest
    });

    return user;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    // Regular users can only update their own profile
    if (decodedToken.role === Role.USER) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this user");
        }
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Prevent modifying role, isActive, isDeleted, isVerified for non-admins
    if (decodedToken.role === Role.USER) {
        if (payload.role || payload.isActive || payload.isDeleted || payload.isVerified) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to modify these fields");
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    return updatedUser;
};

const getAllUsers = async () => {
    const users = await User.find({ isDeleted: false });
    return users;
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

const deleteUser = async (userId: string) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { isDeleted: true },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return user;
};

export const UserService = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe,
    deleteUser
};
