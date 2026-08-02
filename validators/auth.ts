import { z } from "zod";

import { emailSchema, passwordSchema } from "./common";

/**
 * Sign-in input.
 *
 * The password is only checked for presence. Applying the strength rules here
 * would reject existing passwords that predate a rule change, and would tell an
 * attacker which stored passwords are weak.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  /** Same-site path to return to. Re-validated by `safeReturnPath` before use. */
  next: z.string().optional(),
});

/** Changing a password while signed in — the current one must be proven. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password you have not used before.",
    path: ["newPassword"],
  });

/**
 * First-login password change.
 *
 * Same as above minus the confirmation of the old password — the user proved it
 * moments ago at sign-in, and asking again for a password they were handed on a
 * slip of paper is friction with no security value.
 */
export const setInitialPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is incomplete."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetInitialPasswordInput = z.infer<typeof setInitialPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
