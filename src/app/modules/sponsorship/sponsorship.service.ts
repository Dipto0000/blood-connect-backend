/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import SSLCommerzPayment from "sslcommerz-lts";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { Post } from "../post/post.model";
import { User } from "../user/user.model";
import { SponsorRide } from "./sponsorship.model";

const RIDE_FARE_AMOUNT = 200; // Fixed amount in BDT

interface InitiatePaymentParams {
    sponsorId: string;
    donorId: string;
    postId: string;
}

const initiateSponsorPayment = async (params: InitiatePaymentParams) => {
    const { sponsorId, donorId, postId } = params;

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new AppError(httpStatus.NOT_FOUND, "Post not found");
    }

    // Check if donor is in interested list
    const isDonorInterested = post.interactions.interested.some(
        (id) => id.toString() === donorId
    );
    if (!isDonorInterested) {
        throw new AppError(httpStatus.BAD_REQUEST, "Donor is not in interested list for this post");
    }

    // Check if already sponsored
    const existingSponsorship = await SponsorRide.findOne({
        post: new Types.ObjectId(postId),
        donor: new Types.ObjectId(donorId),
        status: "SUCCESS"
    });
    if (existingSponsorship) {
        throw new AppError(httpStatus.BAD_REQUEST, "This donor's ride has already been sponsored");
    }

    // Get sponsor details
    const sponsor = await User.findById(sponsorId);
    if (!sponsor) {
        throw new AppError(httpStatus.NOT_FOUND, "Sponsor not found");
    }

    // Generate unique transaction ID
    const transactionId = `SPONSOR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create pending sponsorship record
    const sponsorship = await SponsorRide.create({
        sponsor: new Types.ObjectId(sponsorId),
        donor: new Types.ObjectId(donorId),
        post: new Types.ObjectId(postId),
        amount: RIDE_FARE_AMOUNT,
        transactionId,
        status: "PENDING"
    });

    // SSLCommerz payment data
    const paymentData = {
        total_amount: RIDE_FARE_AMOUNT,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${envVars.FRONTEND_URL}/api/v1/sponsorship/success`,
        fail_url: `${envVars.FRONTEND_URL}/api/v1/sponsorship/fail`,
        cancel_url: `${envVars.FRONTEND_URL}/api/v1/sponsorship/cancel`,
        ipn_url: `${envVars.FRONTEND_URL}/api/v1/sponsorship/ipn`,
        shipping_method: "NO",
        product_name: "Sponsor Ride for Blood Donation",
        product_category: "Donation",
        product_profile: "non-physical-goods",
        cus_name: sponsor.name,
        cus_email: sponsor.email,
        cus_add1: sponsor.address || "N/A",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: sponsor.phone || "N/A",
        ship_name: "N/A",
        ship_add1: "N/A",
        ship_city: "N/A",
        ship_state: "N/A",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
        value_a: postId,
        value_b: donorId,
        value_c: sponsorId
    };

    // Initialize SSLCommerz
    const sslcz = new SSLCommerzPayment(
        envVars.SSLCOMMERZ_STORE_ID,
        envVars.SSLCOMMERZ_STORE_PASSWORD,
        envVars.SSLCOMMERZ_IS_LIVE
    );

    const apiResponse = await sslcz.init(paymentData);

    if (!apiResponse.GatewayPageURL) {
        // Delete pending record if init fails
        await SponsorRide.findByIdAndDelete(sponsorship._id);
        throw new AppError(httpStatus.BAD_REQUEST, "Failed to initiate payment");
    }

    return {
        gatewayUrl: apiResponse.GatewayPageURL,
        transactionId
    };
};

const handlePaymentSuccess = async (paymentData: any) => {
    const { tran_id, val_id, status } = paymentData;

    if (status !== "VALID") {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment status");
    }

    const sponsorship = await SponsorRide.findOne({ transactionId: tran_id });

    if (!sponsorship) {
        throw new AppError(httpStatus.NOT_FOUND, "Sponsorship record not found");
    }

    if (sponsorship.status === "SUCCESS") {
        return sponsorship; // Already processed
    }

    // Update sponsorship status
    sponsorship.status = "SUCCESS";
    sponsorship.paymentDetails = paymentData;
    await sponsorship.save();

    // Add to post's sponsoredRides
    await Post.findByIdAndUpdate(sponsorship.post, {
        $push: {
            sponsoredRides: {
                donor: sponsorship.donor,
                sponsor: sponsorship.sponsor,
                transactionId: tran_id,
                sponsoredAt: new Date()
            }
        }
    });

    return sponsorship;
};

const handlePaymentFail = async (paymentData: any) => {
    const { tran_id } = paymentData;

    const sponsorship = await SponsorRide.findOneAndUpdate(
        { transactionId: tran_id },
        { status: "FAILED", paymentDetails: paymentData },
        { new: true }
    );

    return sponsorship;
};

const handlePaymentCancel = async (paymentData: any) => {
    const { tran_id } = paymentData;

    const sponsorship = await SponsorRide.findOneAndUpdate(
        { transactionId: tran_id },
        { status: "CANCELLED", paymentDetails: paymentData },
        { new: true }
    );

    return sponsorship;
};

const getSponsorshipsByPost = async (postId: string) => {
    return SponsorRide.find({ post: new Types.ObjectId(postId), status: "SUCCESS" })
        .populate("sponsor", "name email")
        .populate("donor", "name email bloodGroup");
};

const getMySponsorships = async (userId: string) => {
    return SponsorRide.find({ sponsor: new Types.ObjectId(userId) })
        .populate("donor", "name email bloodGroup")
        .populate("post", "patientName hospital")
        .sort({ createdAt: -1 });
};

export const SponsorshipService = {
    initiateSponsorPayment,
    handlePaymentSuccess,
    handlePaymentFail,
    handlePaymentCancel,
    getSponsorshipsByPost,
    getMySponsorships
};
