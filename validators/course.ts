import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { collapseWhitespace, normalizeCourseCode } from "@/utils/text";
import { optionalText, paginationSchema, uuidSchema } from "./common";

/** Course code: letters, digits, hyphens. Upper-cased so `phy101` === `PHY101`. */
const courseCodeSchema = z
  .string()
  .transform(normalizeCourseCode)
  .pipe(
    z
      .string()
      .min(LIMITS.COURSE_CODE_MIN, "Course code must be at least 2 characters.")
      .max(LIMITS.COURSE_CODE_MAX, "Course code is too long.")
      .regex(
        /^[A-Z0-9-]+$/,
        "Course code may only contain letters, numbers, and hyphens."
      )
  );

const courseTitleSchema = z
  .string()
  .transform(collapseWhitespace)
  .pipe(
    z
      .string()
      .min(LIMITS.COURSE_TITLE_MIN, "Title must be at least 2 characters.")
      .max(LIMITS.COURSE_TITLE_MAX, "Title is too long.")
  );

/** Academic year such as "2025/2026" or a single "2026". */
const academicYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}(\/\d{4})?$/, 'Use a format like "2025/2026".')
  .optional();

export const createCourseSchema = z.object({
  title: courseTitleSchema,
  code: courseCodeSchema,
  description: optionalText(
    LIMITS.COURSE_DESCRIPTION_MAX,
    "Description is too long."
  ),
  academicYear: academicYearSchema,
});

/** Every field optional — a PATCH-style update. */
export const updateCourseSchema = createCourseSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const courseIdSchema = z.object({ courseId: uuidSchema });

export const listCoursesSchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  includeArchived: z.coerce.boolean().default(false),
});

/** Enrol or remove students in bulk. */
export const courseEnrolmentSchema = z.object({
  courseId: uuidSchema,
  studentIds: z
    .array(uuidSchema)
    .min(1, "Select at least one student.")
    .max(LIMITS.BULK_IMPORT_MAX_ROWS, "Too many students in one request."),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesInput = z.infer<typeof listCoursesSchema>;
export type CourseEnrolmentInput = z.infer<typeof courseEnrolmentSchema>;
