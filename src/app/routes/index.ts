import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { PostRoutes } from "../modules/post/post.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router();

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/post",
        route: PostRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
