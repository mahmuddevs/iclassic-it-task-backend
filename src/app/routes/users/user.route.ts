import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { UpdateUserRoleSchema } from "../../schemas/user.schema.js";
import { getAllUsers, updateUserRole, deleteUser } from "../../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/", authorize("users.read"), getAllUsers);
userRoutes.patch("/:id/role", authorize("users.update"), validate(UpdateUserRoleSchema), updateUserRole);
userRoutes.delete("/:id", authorize("users.delete"), deleteUser);

export default userRoutes;