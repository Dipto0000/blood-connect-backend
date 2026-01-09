import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SponsorshipService } from "./sponsorship.service";

// Initiate payment for sponsoring a ride
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const sponsorId = (req.user as JwtPayload).userId;
    const { donorId, postId } = req.body;

    const result = await SponsorshipService.initiateSponsorPayment({
        sponsorId,
        donorId,
        postId
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result
    });
});

// SSLCommerz IPN success callback
const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
    await SponsorshipService.handlePaymentSuccess(req.body);

    // Redirect to frontend success page
    res.redirect(`${envVars.FRONTEND_URL}/payment/success?tran_id=${req.body.tran_id}`);
});

// SSLCommerz IPN fail callback
const paymentFail = catchAsync(async (req: Request, res: Response) => {
    await SponsorshipService.handlePaymentFail(req.body);

    // Redirect to frontend fail page
    res.redirect(`${envVars.FRONTEND_URL}/payment/fail?tran_id=${req.body.tran_id}`);
});

// SSLCommerz cancel callback
const paymentCancel = catchAsync(async (req: Request, res: Response) => {
    await SponsorshipService.handlePaymentCancel(req.body);

    // Redirect to frontend cancel page
    res.redirect(`${envVars.FRONTEND_URL}/payment/cancel?tran_id=${req.body.tran_id}`);
});

// SSLCommerz IPN (server-to-server notification)
const paymentIPN = catchAsync(async (req: Request, res: Response) => {
    await SponsorshipService.handlePaymentSuccess(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "IPN received",
        data: null
    });
});

// Get sponsorships for a post
const getSponsorshipsByPost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const sponsorships = await SponsorshipService.getSponsorshipsByPost(postId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Sponsorships retrieved successfully",
        data: sponsorships
    });
});

// Get my sponsorships
const getMySponsorships = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;
    const sponsorships = await SponsorshipService.getMySponsorships(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your sponsorships retrieved successfully",
        data: sponsorships
    });
});

export const SponsorshipController = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIPN,
    getSponsorshipsByPost,
    getMySponsorships
};
