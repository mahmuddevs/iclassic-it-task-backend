import { Router } from "express";
import authRoutes from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";

const router = Router();

router.use("/auth", authRoutes)
router.use("/user", userRoutes)

export default router;
