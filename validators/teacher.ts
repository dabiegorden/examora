import { z } from "zod";

import { emailSchema, nameSchema, passwordSchema, uuidSchema } from "./common";
import { userStatusSchema } from "./student";

export const createTeacherSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const updateTeacherSchema = z.object({
  fullName: nameSchema.optional(),
  email: emailSchema.optional(),
  status: userStatusSchema.optional(),
});

export const teacherIdSchema = z.object({ teacherId: uuidSchema });

/**
 * Sign-in input.
 *
 * The password is only checked for presence here — applying the strength rules
 * would leak which existing passwords are "too weak" to anyone probing the form.
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password you have not used before.",
    path: ["newPassword"],
  });

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
