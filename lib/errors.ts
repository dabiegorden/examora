import type { FieldErrors } from "@/types/common";

/**
 * Typed application errors.
 *
 * Repositories throw these for genuinely exceptional conditions. Expected
 * outcomes (a lookup that legitimately finds nothing) return `null` or a
 * `Result` instead — throwing for those makes ordinary control flow expensive.
 */

export type AppErrorCode =
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DATABASE";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    code: AppErrorCode,
    status: number,
    fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** The requested row does not exist, and the caller required it to. */
export class NotFoundError extends AppError {
  constructor(entity: string, identifier?: string) {
    super(
      identifier ? `${entity} "${identifier}" was not found.` : `${entity} was not found.`,
      "NOT_FOUND",
      404
    );
  }
}

/** Input failed validation. Carries per-field messages for the form. */
export class ValidationError extends AppError {
  constructor(message = "The submitted data is invalid.", fieldErrors?: FieldErrors) {
    super(message, "VALIDATION", 422, fieldErrors);
  }
}

/** The write clashes with existing data, e.g. a duplicate course code. */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

/** No valid session. */
export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to do that.") {
    super(message, "UNAUTHORIZED", 401);
  }
}

/** Signed in, but not allowed to touch this resource. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource.") {
    super(message, "FORBIDDEN", 403);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Turn an unknown thrown value into a message safe to show a user.
 *
 * Only `AppError` messages are surfaced verbatim — they are authored by us.
 * Anything else could carry driver internals or connection strings, so it is
 * logged and replaced with a generic line.
 */
export function toUserMessage(error: unknown): string {
  if (isAppError(error)) return error.message;

  console.error("[examora] unexpected error:", error);
  return "Something went wrong. Please try again.";
}
