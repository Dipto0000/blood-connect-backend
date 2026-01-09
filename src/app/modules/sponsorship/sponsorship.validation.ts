import { z } from "zod";

export const initiatePaymentZodSchema = z.object({
    donorId: z.string().min(1, "Donor ID is required"),
    postId: z.string().min(1, "Post ID is required")
});
