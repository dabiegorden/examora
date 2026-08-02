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

// Sign-in and password-change schemas live in `validators/auth.ts` — they apply
// to both roles, so keeping them here would have made them look teacher-only.

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
