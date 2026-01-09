import mongoose, { Schema, Model } from "mongoose";
import { IPost } from "./post.interface";

const liftConnectionSchema = new Schema({
    rider: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    donor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const postSchema = new Schema<IPost>({
    seeker: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seeker is required"]
    },
    patientName: {
        type: String,
        required: [true, "Patient name is required"],
        trim: true
    },
    bloodGroup: {
        type: String,
        required: [true, "Blood group is required"],
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    },
    unitsNeeded: {
        type: Number,
        required: [true, "Units needed is required"],
        min: [1, "At least 1 unit is required"],
        default: 1
    },
    hospital: {
        type: String,
        required: [true, "Hospital name is required"],
        trim: true
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required"],
        trim: true
    },
    urgency: {
        type: String,
        enum: ["normal", "urgent", "critical"],
        default: "normal"
    },
    notes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["open", "fulfilled", "closed"],
        default: "open"
    },
    interactions: {
        going: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        interested: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        givingLift: [liftConnectionSchema]
    },
    expiresAt: {
        type: Date
    },
    sponsoredRides: [{
        donor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sponsor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        transactionId: {
            type: String,
            required: true
        },
        sponsoredAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
postSchema.index({ bloodGroup: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ seeker: 1 });

export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
