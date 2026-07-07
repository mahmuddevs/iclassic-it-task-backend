import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { UpdateRolePermissionsSchema } from "../../schemas/role.schema.js";
import { getAllRoles, getAllPermissions, updateRolePermissions } from "../../controllers/role.controller.js";

const roleRoutes = Router();

roleRoutes.get("/", authorize("permissions.read"), getAllRoles);
roleRoutes.get("/permissions", authorize("permissions.read"), getAllPermissions);
roleRoutes.patch("/:roleName/permissions", authorize("permissions.update"), validate(UpdateRolePermissionsSchema), updateRolePermissions);

export default roleRoutes;
