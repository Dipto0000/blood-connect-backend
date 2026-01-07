import { z } from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long.")
        .max(50, "Name cannot exceed 50 characters."),
    email: z
        .string()
        .email("Invalid email address format."),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long."),
    phone: z
        .string()
        .optional(),
    address: z
        .string()
        .max(200, "Address cannot exceed 200 characters.")
        .optional(),
    bloodGroup: z
        .enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
        .optional(),
    userRoles: z
        .array(z.enum(["donor", "rider", "seeker"]))
        .optional()
});

export const updateUserZodSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long.")
        .max(50, "Name cannot exceed 50 characters.")
        .optional(),
    phone: z
        .string()
        .optional(),
    address: z
        .string()
        .max(200, "Address cannot exceed 200 characters.")
        .optional(),
    bloodGroup: z
        .enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
        .optional(),
    userRoles: z
        .array(z.enum(["donor", "rider", "seeker"]))
        .optional(),
    role: z
        .enum([Role.ADMIN, Role.USER])
        .optional(),
    isActive: z
        .enum([IsActive.ACTIVE, IsActive.INACTIVE, IsActive.BLOCKED])
        .optional(),
    isDeleted: z
        .boolean()
        .optional(),
    isVerified: z
        .boolean()
        .optional()
});
