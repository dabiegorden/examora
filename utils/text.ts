/**
 * Canonical email form used for both storage and lookup.
 *
 * The unique index on `users.email` is a plain b-tree, so it only prevents
 * duplicates if every write and every read normalizes identically. Always route
 * addresses through this function.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Course codes are compared case-insensitively, e.g. `phy101` === `PHY101`. */
export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizeStudentNumber(studentNumber: string): string {
  return studentNumber.trim().toUpperCase();
}

/** Collapse runs of whitespace and trim — for names and free-text titles. */
export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Percentage of `total`, rounded to two decimals. Returns 0 when total is 0. */
export function toPercentage(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 10_000) / 100;
}
