import { Router } from "express";
import authRoutes from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import productRoutes from "./products/product.route.js";
import saleRoutes from "./sales/sale.route.js";
import roleRoutes from "./roles/role.route.js";

const router = Router();

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/sales", saleRoutes)
router.use("/roles", roleRoutes)

export default router;
