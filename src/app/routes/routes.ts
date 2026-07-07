import { Router } from "express";
import authRoutes from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import productRoutes from "./products/product.route.js";
import saleRoutes from "./sales/sale.route.js";
import roleRoutes from "./roles/role.route.js";
import analyticsRoutes from "./analytics/analytics.route.js";
import chatRoutes from "./chat/chat.route.js";

const router = Router();

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/sales", saleRoutes)
router.use("/roles", roleRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/chat", chatRoutes)

export default router;
