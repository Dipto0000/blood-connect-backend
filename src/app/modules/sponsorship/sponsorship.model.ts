import mongoose, { Schema, Model } from "mongoose";
import { ISponsorRide } from "./sponsorship.interface";

const sponsorRideSchema = new Schema<ISponsorRide>({
    sponsor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sponsor is required"]
    },
    donor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Donor is required"]
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post is required"]
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        default: 200
    },
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true
    },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
        default: "PENDING"
    },
    paymentDetails: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes
sponsorRideSchema.index({ transactionId: 1 });
sponsorRideSchema.index({ post: 1, donor: 1 });
sponsorRideSchema.index({ sponsor: 1 });

export const SponsorRide: Model<ISponsorRide> = mongoose.model<ISponsorRide>("SponsorRide", sponsorRideSchema);
