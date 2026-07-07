import { z } from "zod";

export const UpdateRolePermissionsSchema = z.object({
  params: z.object({
    roleName: z.enum(["Manager", "Employee"], {
      message: "Role name must be one of: Manager, Employee",
    }),
  }),
  body: z.object({
    permissionNames: z.array(z.string(), {
      message: "permissionNames must be an array of string permission names.",
    }),
  }),
});
