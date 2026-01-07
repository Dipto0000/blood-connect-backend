import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { PostController } from "./post.controller";
import { createPostZodSchema, giveLiftZodSchema, updatePostZodSchema } from "./post.validation";

const router = Router();

// ======================
// PUBLIC ROUTES (No auth required)
// ======================
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);

// ======================
// PROTECTED ROUTES (Auth required)
// ======================

// User's own posts
router.get("/user/my-posts", checkAuth(...Object.values(Role)), PostController.getMyPosts);

// Create a new blood request
router.post("/",
    checkAuth(...Object.values(Role)),
    validateRequest(createPostZodSchema),
    PostController.createPost
);

// Update post (Owner or Admin)
router.patch("/:id",
    checkAuth(...Object.values(Role)),
    validateRequest(updatePostZodSchema),
    PostController.updatePost
);

// Delete post (Owner or Admin can delete any)
router.delete("/:id", checkAuth(...Object.values(Role)), PostController.deletePost);

// ======================
// INTERACTION ROUTES
// ======================

// "Going" - Donor can reach hospital themselves
router.post("/:id/going", checkAuth(...Object.values(Role)), PostController.markGoing);
router.delete("/:id/going", checkAuth(...Object.values(Role)), PostController.removeGoing);

// "Interested" - Donor needs a ride
router.post("/:id/interested", checkAuth(...Object.values(Role)), PostController.markInterested);
router.delete("/:id/interested", checkAuth(...Object.values(Role)), PostController.removeInterested);

// "Give Lift" - Rider offers lift to a donor
router.post("/:id/give-lift",
    checkAuth(...Object.values(Role)),
    validateRequest(giveLiftZodSchema),
    PostController.giveLift
);
router.delete("/:id/give-lift", checkAuth(...Object.values(Role)), PostController.cancelLift);

export const PostRoutes = router;
