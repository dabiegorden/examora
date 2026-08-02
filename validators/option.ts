import { z } from "zod";

import { LIMITS } from "@/constants/app";
import { uuidSchema } from "./common";

export const optionTextSchema = z
  .string()
  .trim()
  .min(LIMITS.OPTION_TEXT_MIN, "An option cannot be empty.")
  .max(LIMITS.OPTION_TEXT_MAX, "Option text is too long.");

/** An option as authored inside a question form — no id yet. */
export const optionDraftSchema = z.object({
  text: optionTextSchema,
  isCorrect: z.boolean().default(false),
});

export const createOptionSchema = optionDraftSchema.extend({
  questionId: uuidSchema,
  order: z.number().int().min(0).default(0),
});

export const updateOptionSchema = z.object({
  text: optionTextSchema.optional(),
  isCorrect: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * A complete option set for one question.
 *
 * The two refinements encode what makes a question answerable at all: enough
 * choices to choose between, and at least one that is right. Checking here means
 * no half-valid question ever reaches the database.
 */
export const optionSetSchema = z
  .array(optionDraftSchema)
  .min(
    LIMITS.OPTIONS_PER_QUESTION_MIN,
    "A question needs at least 2 options."
  )
  .max(
    LIMITS.OPTIONS_PER_QUESTION_MAX,
    "A question can have at most 8 options."
  )
  .refine(
    (options) => options.some((option) => option.isCorrect),
    "Mark at least one option as correct."
  )
  .refine((options) => {
    const seen = new Set(options.map((option) => option.text.toLowerCase()));
    return seen.size === options.length;
  }, "Options must be distinct.");

export type OptionDraftInput = z.infer<typeof optionDraftSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
export type OptionSetInput = z.infer<typeof optionSetSchema>;
