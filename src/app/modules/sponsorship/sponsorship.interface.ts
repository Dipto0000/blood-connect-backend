import { Types } from "mongoose";

export type SponsorshipStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface ISponsorRide {
    _id?: Types.ObjectId;
    sponsor: Types.ObjectId;
    donor: Types.ObjectId;
    post: Types.ObjectId;
    amount: number;
    transactionId: string;
    status: SponsorshipStatus;
    paymentDetails?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}
