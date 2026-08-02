import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { paginationSchema, uuidSchema } from "./common";
import { optionSetSchema } from "./option";

export const questionTextSchema = z
  .string()
  .trim()
  .min(LIMITS.QUESTION_TEXT_MIN, "Enter the question.")
  .max(LIMITS.QUESTION_TEXT_MAX, "Question text is too long.");

export const marksSchema = z
  .number()
  .int("Marks must be a whole number.")
  .min(LIMITS.QUESTION_MARKS_MIN, "A question must be worth at least 1 mark.")
  .max(LIMITS.QUESTION_MARKS_MAX, "That is too many marks for one question.");

/**
 * A question and its options together.
 *
 * They are validated as a unit because a question without a correct option is
 * not a valid question — see the refinements on `optionSetSchema`.
 */
export const createQuestionSchema = z.object({
  examId: uuidSchema,
  question: questionTextSchema,
  marks: marksSchema.default(1),
  order: z.number().int().min(0),
  options: optionSetSchema,
});

export const updateQuestionSchema = z.object({
  question: questionTextSchema.optional(),
  marks: marksSchema.optional(),
  order: z.number().int().min(0).optional(),
  /** When present, replaces the whole option set. */
  options: optionSetSchema.optional(),
});

export const questionIdSchema = z.object({ questionId: uuidSchema });

export const listQuestionsSchema = paginationSchema.extend({
  examId: uuidSchema,
});

/** Drag-and-drop reordering: the new sequence of question ids. */
export const reorderQuestionsSchema = z.object({
  examId: uuidSchema,
  questionIds: z.array(uuidSchema).min(1, "Nothing to reorder."),
});

/** One row of an imported question sheet, before it becomes a question. */
export const importQuestionRowSchema = z.object({
  question: questionTextSchema,
  marks: z.coerce.number().pipe(marksSchema).default(1),
  options: optionSetSchema,
});

export const importQuestionsSchema = z.object({
  examId: uuidSchema,
  rows: z
    .array(importQuestionRowSchema)
    .min(1, "The file contained no questions.")
    .max(LIMITS.BULK_IMPORT_MAX_ROWS, "Too many questions in one import."),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type ImportQuestionsInput = z.infer<typeof importQuestionsSchema>;
