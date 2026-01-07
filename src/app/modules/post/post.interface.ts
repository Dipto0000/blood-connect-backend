import { Types } from "mongoose";

export type UrgencyLevel = "normal" | "urgent" | "critical";
export type PostStatus = "open" | "fulfilled" | "closed";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export interface LiftConnection {
    rider: Types.ObjectId;
    donor: Types.ObjectId;
    createdAt: Date;
}

export interface Interactions {
    going: Types.ObjectId[];
    interested: Types.ObjectId[];
    givingLift: LiftConnection[];
}

export interface IPost {
    _id?: Types.ObjectId;
    seeker: Types.ObjectId;
    patientName: string;
    bloodGroup: BloodGroup;
    unitsNeeded: number;
    hospital: string;
    location: string;
    contactNumber: string;
    urgency: UrgencyLevel;
    notes?: string;
    status: PostStatus;
    interactions: Interactions;
    createdAt?: Date;
    updatedAt?: Date;
    expiresAt?: Date;
}
