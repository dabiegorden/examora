import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { EXAM_STATUS } from "@/constants/roles";
import { collapseWhitespace } from "@/utils/text";
import { optionalText, paginationSchema, uuidSchema } from "./common";

const examTitleSchema = z
  .string()
  .transform(collapseWhitespace)
  .pipe(
    z
      .string()
      .min(LIMITS.EXAM_TITLE_MIN, "Title must be at least 2 characters.")
      .max(LIMITS.EXAM_TITLE_MAX, "Title is too long.")
  );

export const examStatusSchema = z.enum([
  EXAM_STATUS.DRAFT,
  EXAM_STATUS.PUBLISHED,
  EXAM_STATUS.COMPLETED,
]);

/** The anti-cheating and experience switches, all optional with schema defaults. */
export const examSettingsSchema = z.object({
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  allowResultsImmediately: z.boolean().optional(),
  fullscreenRequired: z.boolean().optional(),
  autoSubmit: z.boolean().optional(),
});

const examBaseSchema = z.object({
  courseId: uuidSchema,
  title: examTitleSchema,
  instructions: optionalText(
    LIMITS.EXAM_INSTRUCTIONS_MAX,
    "Instructions are too long."
  ),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  overallDurationMinutes: z
    .number()
    .int()
    .min(LIMITS.EXAM_DURATION_MIN_MINUTES, "An exam must last at least 1 minute.")
    .max(LIMITS.EXAM_DURATION_MAX_MINUTES, "An exam cannot run longer than 8 hours."),
  questionDurationSeconds: z
    .number()
    .int()
    .min(LIMITS.QUESTION_DURATION_MIN_SECONDS, "Give students at least 5 seconds.")
    .max(LIMITS.QUESTION_DURATION_MAX_SECONDS, "That per-question limit is too long.")
    .optional(),
});

/**
 * The window has to be coherent, and it has to be long enough to actually fit
 * the exam — a 60-minute paper in a 30-minute window would auto-submit half the
 * cohort mid-question.
 */
function refineWindow<TSchema extends z.ZodType<z.infer<typeof examBaseSchema>>>(
  schema: TSchema
) {
  return schema
    .refine(
      (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
      { message: "The end time must be after the start time.", path: ["endTime"] }
    )
    .refine(
      (data) => {
        if (!data.startTime || !data.endTime) return true;
        const windowMinutes =
          (data.endTime.getTime() - data.startTime.getTime()) / 60_000;
        return windowMinutes >= data.overallDurationMinutes;
      },
      {
        message: "The sitting window is shorter than the exam duration.",
        path: ["endTime"],
      }
    );
}

export const createExamSchema = refineWindow(examBaseSchema.extend(examSettingsSchema.shape));

/**
 * Update input.
 *
 * `courseId` is omitted deliberately: moving an exam between courses would
 * orphan its attempts and enrolment checks, so it is not an edit.
 */
export const updateExamSchema = examBaseSchema
  .omit({ courseId: true })
  .extend(examSettingsSchema.shape)
  .partial()
  .refine(
    (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
    { message: "The end time must be after the start time.", path: ["endTime"] }
  );

export const examIdSchema = z.object({ examId: uuidSchema });

export const listExamsSchema = paginationSchema.extend({
  courseId: uuidSchema.optional(),
  status: examStatusSchema.optional(),
  search: z.string().trim().max(120).optional(),
});

/** Publishing is a state change with its own preconditions, not a field edit. */
export const publishExamSchema = z.object({
  examId: uuidSchema,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ListExamsInput = z.infer<typeof listExamsSchema>;
export type PublishExamInput = z.infer<typeof publishExamSchema>;
export type ExamSettingsInput = z.infer<typeof examSettingsSchema>;
