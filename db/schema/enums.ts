import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enum types.
 *
 * Values are stored snake_case/lowercase so they read naturally in raw SQL.
 * The matching TypeScript unions live in `types/db.ts`, inferred from these
 * definitions rather than written out a second time.
 */

/** Examora has exactly two actors: the teacher who sets exams, and the student who sits them. */
export const userRoleEnum = pgEnum("user_role", ["teacher", "student"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
]);

export const examStatusEnum = pgEnum("exam_status", [
  "draft",
  "published",
  "completed",
]);

export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
  "auto_submitted",
]);

/**
 * Auditable actions.
 *
 * Adding a value later is a cheap `ALTER TYPE ... ADD VALUE` migration, so this
 * stays an enum for type safety rather than becoming a free-text column.
 */
export const auditActionEnum = pgEnum("audit_action", [
  "LOGIN",
  "LOGIN_FAILED",
  "LOGOUT",
  "SESSION_REVOKED",
  "EXAM_PUBLISHED",
  "EXAM_STARTED",
  "QUESTION_ANSWERED",
  "TAB_SWITCH",
  "FULLSCREEN_EXIT",
  "EXAM_SUBMITTED",
  "AUTO_SUBMITTED",
]);
