import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { collapseWhitespace, normalizeCourseCode } from "@/utils/text";
import {
  optionalText,
  paginationSchema,
  sortDirectionSchema,
  uuidSchema,
} from "./common";

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

/**
 * Academic year such as "2025/2026" or a single "2026".
 *
 * The field is optional, and an empty value means "not provided" rather than
 * "invalid" — a cleared input submits `""`, not `undefined`. Both predicates
 * are shared with the form schema below so the two can never disagree.
 */
function isAcademicYearShape(value: string | undefined): boolean {
  if (!value) return true;
  return /^\d{4}(\/\d{4})?$/.test(value);
}

/** Rejects "2025/2019", which has the right shape and no meaning. */
function isAcademicYearOrdered(value: string | undefined): boolean {
  if (!value?.includes("/")) return true;
  const [start, end] = value.split("/").map(Number);
  return end === start + 1;
}

const academicYearSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional()
  .refine(isAcademicYearShape, 'Use a format like "2025/2026".')
  .refine(isAcademicYearOrdered, "The second year must follow the first.");

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

/** A bare course id, for actions that take it as a positional argument. */
export const uuidCourseIdSchema = uuidSchema;

/**
 * Which slice of the teacher's courses to show.
 *
 * Deleted courses are not a status — a soft-deleted row is invisible to the
 * teacher entirely, so there is no filter that reveals one.
 */
export const COURSE_STATUS_FILTERS = ["active", "archived", "all"] as const;
export type CourseStatusFilter = (typeof COURSE_STATUS_FILTERS)[number];

/** Sortable columns. Counts are computed, so these are not all real columns. */
export const COURSE_SORT_FIELDS = [
  "title",
  "createdAt",
  "studentCount",
  "examCount",
] as const;
export type CourseSortField = (typeof COURSE_SORT_FIELDS)[number];

/**
 * Query state for the course list.
 *
 * Parsed from the URL, so every field tolerates a missing or malformed value
 * and falls back to the default rather than erroring: a hand-edited query
 * string should degrade to a sensible list, not a crash.
 */
export const listCoursesSchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  status: z.enum(COURSE_STATUS_FILTERS).default("active"),
  academicYear: z
    .string()
    .trim()
    .max(9)
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional(),
  sortBy: z.enum(COURSE_SORT_FIELDS).default("createdAt"),
  sortDirection: sortDirectionSchema,
});

/* -------------------------------------------------------------------------- */
/*                                 Form schema                                */
/* -------------------------------------------------------------------------- */

/**
 * The shape the course form binds to.
 *
 * Separate from `createCourseSchema` because React Hook Form needs a schema
 * whose input and output types match: a control is always bound to a string,
 * and an optional field that is *transformed* to `undefined` would leave the
 * field typed as `string | undefined` and the input flipping between controlled
 * and uncontrolled. So every field here stays a string, an empty one means "not
 * provided", and the server schema does the narrowing.
 *
 * The rules are the same ones — this is a stricter surface, never a looser one.
 * The server re-validates with `createCourseSchema` regardless.
 */
export const courseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LIMITS.COURSE_TITLE_MIN, "Title must be at least 2 characters.")
    .max(LIMITS.COURSE_TITLE_MAX, "Title is too long."),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(LIMITS.COURSE_CODE_MIN, "Course code must be at least 2 characters.")
    .max(LIMITS.COURSE_CODE_MAX, "Course code is too long.")
    .regex(
      /^[A-Z0-9-]+$/,
      "Course code may only contain letters, numbers, and hyphens."
    ),
  description: z
    .string()
    .trim()
    .max(LIMITS.COURSE_DESCRIPTION_MAX, "Description is too long."),
  academicYear: z
    .string()
    .trim()
    .refine(isAcademicYearShape, 'Use a format like "2025/2026".')
    .refine(isAcademicYearOrdered, "The second year must follow the first."),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

/** Empty form state. Every field is a string so no input starts uncontrolled. */
export const EMPTY_COURSE_FORM: CourseFormValues = {
  title: "",
  code: "",
  description: "",
  academicYear: "",
};

/** Enrol or remove students in bulk. */
export const courseEnrolmentSchema = z.object({
  courseId: uuidSchema,
  studentIds: z
    .array(uuidSchema)
    .min(1, "Select at least one student.")
    .max(LIMITS.BULK_IMPORT_MAX_ROWS, "Too many students in one request."),
});

export type CreateCourseInput = z.output<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesInput = z.infer<typeof listCoursesSchema>;
export type CourseEnrolmentInput = z.infer<typeof courseEnrolmentSchema>;
