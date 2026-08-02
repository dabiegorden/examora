import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { USER_STATUS } from "@/constants/roles";
import { normalizeStudentNumber } from "@/utils/text";
import {
  emailSchema,
  nameSchema,
  paginationSchema,
  passwordSchema,
  uuidSchema,
} from "./common";

export const studentNumberSchema = z
  .string()
  .transform(normalizeStudentNumber)
  .pipe(
    z
      .string()
      .min(LIMITS.STUDENT_NUMBER_MIN, "Enter a student number.")
      .max(LIMITS.STUDENT_NUMBER_MAX, "Student number is too long.")
      .regex(
        /^[A-Z0-9/-]+$/,
        "Student numbers may only contain letters, numbers, hyphens, and slashes."
      )
  );

export const userStatusSchema = z.enum([
  USER_STATUS.ACTIVE,
  USER_STATUS.INACTIVE,
  USER_STATUS.SUSPENDED,
]);

/**
 * Creating a student.
 *
 * `password` is optional: bulk imports generate a temporary one, while a
 * teacher adding a single student may set it themselves.
 */
export const createStudentSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  studentNumber: studentNumberSchema,
  password: passwordSchema.optional(),
  courseIds: z.array(uuidSchema).optional(),
});

export const updateStudentSchema = z.object({
  fullName: nameSchema.optional(),
  email: emailSchema.optional(),
  studentNumber: studentNumberSchema.optional(),
  status: userStatusSchema.optional(),
});

export const studentIdSchema = z.object({ studentId: uuidSchema });

export const listStudentsSchema = paginationSchema.extend({
  courseId: uuidSchema.optional(),
  status: userStatusSchema.optional(),
  search: z.string().trim().max(120).optional(),
});

/**
 * One row of an uploaded CSV/Excel roster.
 *
 * Kept separate from `createStudentSchema` so import failures can be reported
 * per row without aborting the whole file.
 */
export const importStudentRowSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  studentNumber: studentNumberSchema,
});

export const importStudentsSchema = z.object({
  courseId: uuidSchema.optional(),
  rows: z
    .array(importStudentRowSchema)
    .min(1, "The file contained no students.")
    .max(LIMITS.BULK_IMPORT_MAX_ROWS, "Too many rows in one import."),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type ListStudentsInput = z.infer<typeof listStudentsSchema>;
export type ImportStudentRow = z.infer<typeof importStudentRowSchema>;
export type ImportStudentsInput = z.infer<typeof importStudentsSchema>;
