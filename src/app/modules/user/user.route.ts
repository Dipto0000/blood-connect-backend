import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();

// Public route - registration
router.post("/register",
    validateRequest(createUserZodSchema),
    UserController.createUser
);

// Protected routes
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);

// Admin only routes
router.get("/", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.get("/:id", checkAuth(Role.ADMIN), UserController.getSingleUser);
router.patch("/:id",
    checkAuth(...Object.values(Role)),
    validateRequest(updateUserZodSchema),
    UserController.updateUser
);
router.delete("/:id", checkAuth(Role.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
