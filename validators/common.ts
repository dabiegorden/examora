import { z } from "zod";

import { LIMITS, PAGINATION } from "@/constants/app";
import { collapseWhitespace, normalizeEmail } from "@/utils/text";

/**
 * Primitives shared by every feature validator, so rules like "what counts as a
 * valid email" are defined exactly once.
 */

export const uuidSchema = z.uuid("Must be a valid identifier.");

/** Trims, collapses inner whitespace, then enforces length. */
export const nameSchema = z
  .string()
  .transform(collapseWhitespace)
  .pipe(
    z
      .string()
      .min(LIMITS.FULL_NAME_MIN, "Name must be at least 2 characters.")
      .max(LIMITS.FULL_NAME_MAX, "Name is too long.")
  );

/** Normalizes to lower-case so it matches the unique index on `users.email`. */
export const emailSchema = z
  .string()
  .max(LIMITS.EMAIL_MAX, "Email is too long.")
  .transform(normalizeEmail)
  .pipe(z.email("Enter a valid email address."));

export const passwordSchema = z
  .string()
  .min(LIMITS.PASSWORD_MIN, "Password must be at least 8 characters.")
  .max(LIMITS.PASSWORD_MAX, "Password is too long.")
  .refine((value) => /[a-z]/.test(value), "Include at least one lowercase letter.")
  .refine((value) => /[A-Z]/.test(value), "Include at least one uppercase letter.")
  .refine((value) => /\d/.test(value), "Include at least one number.");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(PAGINATION.MIN_PAGE_SIZE)
    .max(PAGINATION.MAX_PAGE_SIZE)
    .default(PAGINATION.DEFAULT_PAGE_SIZE),
});

export const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

/** Optional free text that treats an empty string as "not provided". */
export function optionalText(max: number, message?: string) {
  return z
    .string()
    .max(max, message ?? "This value is too long.")
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional();
}

export type PaginationInput = z.infer<typeof paginationSchema>;
