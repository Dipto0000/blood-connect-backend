import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { SponsorshipController } from "./sponsorship.controller";
import { initiatePaymentZodSchema } from "./sponsorship.validation";

const router = Router();

// Protected - Initiate sponsorship payment
router.post("/initiate",
    checkAuth(...Object.values(Role)),
    validateRequest(initiatePaymentZodSchema),
    SponsorshipController.initiatePayment
);

// SSLCommerz callbacks (public - called by SSLCommerz servers)
router.post("/success", SponsorshipController.paymentSuccess);
router.post("/fail", SponsorshipController.paymentFail);
router.post("/cancel", SponsorshipController.paymentCancel);
router.post("/ipn", SponsorshipController.paymentIPN);

// Protected - Get my sponsorships
router.get("/my-sponsorships", checkAuth(...Object.values(Role)), SponsorshipController.getMySponsorships);

// Public - Get sponsorships for a post
router.get("/post/:postId", SponsorshipController.getSponsorshipsByPost);

export const SponsorshipRoutes = router;
