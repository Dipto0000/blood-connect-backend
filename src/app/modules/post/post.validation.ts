import { z } from "zod";

export const createPostZodSchema = z.object({
    patientName: z.string().min(1, "Patient name is required"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    unitsNeeded: z.number().int().positive().optional(),
    hospital: z.string().min(1, "Hospital is required"),
    location: z.string().min(1, "Location is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    urgency: z.enum(["normal", "urgent", "critical"]).optional(),
    notes: z.string().optional(),
    expiresAt: z.string().optional()
});

export const updatePostZodSchema = z.object({
    patientName: z.string().min(1).optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional(),
    unitsNeeded: z.number().int().positive().optional(),
    hospital: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    contactNumber: z.string().min(1).optional(),
    urgency: z.enum(["normal", "urgent", "critical"]).optional(),
    notes: z.string().optional(),
    status: z.enum(["open", "fulfilled", "closed"]).optional(),
    expiresAt: z.string().optional()
});

export const giveLiftZodSchema = z.object({
    donorId: z.string().min(1, "Donor ID is required")
});
