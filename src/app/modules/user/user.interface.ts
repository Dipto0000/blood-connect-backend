import { Types } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export type UserRole = "donor" | "rider" | "seeker";

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    bloodGroup?: BloodGroup;
    userRoles: UserRole[];
    role: Role;
    isDeleted: boolean;
    isActive: IsActive;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
