import { Router } from "express";
import {
  login,
  register,
  verifyAuth,
  logout,
  refreshAccessToken,
} from "../../controllers/auth.controller.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { LoginSchema, UserSchema } from "../../schemas/user.schema.js";

const authRoutes = Router();

authRoutes.post("/", verifyAuth)

authRoutes.post("/login", validate(LoginSchema), login)

authRoutes.post("/register", validate(UserSchema), register)

authRoutes.post("/logout", logout)

authRoutes.post("/refresh-access-token", refreshAccessToken)


export default authRoutes;