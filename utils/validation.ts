import { z } from "zod";

import { ValidationError } from "@/lib/errors";
import type { FieldErrors } from "@/types/common";

/** Collapse a ZodError into `{ fieldPath: [messages] }` for form rendering. */
export function flattenZodError(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    (fieldErrors[key] ??= []).push(issue.message);
  }

  return fieldErrors;
}

/**
 * Parse input, throwing a `ValidationError` that already carries field errors.
 *
 * Use at trust boundaries (server actions, route handlers, the seed importer)
 * where invalid input is a caller mistake rather than a user-facing form error.
 */
export function parseOrThrow<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown
): z.infer<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "The submitted data is invalid.",
      flattenZodError(result.error)
    );
  }

  return result.data;
}
