import { z } from "zod";

export const UserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, "First Name must be at least 3 characters long"),
  lastName: z
    .string()
    .trim()
    .min(3, "Last Name must be at least 3 characters long"),
  email: z
    .email("Not a valid email.")
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter.")
    .refine((val) => /[0-9]/.test(val), "Password must contain at least one number."),
  role: z.string().trim().optional(),
});

export type UserSchema = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const UpdateUserProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First Name must be at least 3 characters long")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(3, "Last Name must be at least 3 characters long")
      .optional(),
    email: z
      .email("Not a valid email.")
      .trim()
      .lowercase()
      .optional(),
    oldPass: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
    newPass: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter.")
      .refine((val) => /[0-9]/.test(val), "Password must contain at least one number.")
      .refine((val) => /[!@#$%^&*(),.?":{}|<>_]/.test(val), "Password must contain at least one special character.")
      .optional(),
  })
  .refine(
    (data) => {
      // If one of oldPass or newPass is present, both must be present
      if ((data.oldPass && !data.newPass) || (!data.oldPass && data.newPass)) {
        return false;
      }
      return true;
    },
    {
      message: "Both old and new passwords are required to change password.",
      path: ["newPass"],
    }
  );

export type UpdateUserProfileType = z.infer<typeof UpdateUserProfileSchema>;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Employee"], {
    message: "Role must be one of: Admin, Manager, Employee",
  }),
});