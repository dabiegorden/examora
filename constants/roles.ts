import type { AttemptStatus, ExamStatus, UserRole, UserStatus } from "@/types/db";

/**
 * Named constants for enum values.
 *
 * Typed against the inferred unions, so a value removed from the Postgres enum
 * becomes a compile error here rather than a runtime surprise.
 */

export const USER_ROLE = {
  TEACHER: "teacher",
  STUDENT: "student",
} as const satisfies Record<string, UserRole>;

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const satisfies Record<string, UserStatus>;

export const EXAM_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  COMPLETED: "completed",
} as const satisfies Record<string, ExamStatus>;

export const ATTEMPT_STATUS = {
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  AUTO_SUBMITTED: "auto_submitted",
} as const satisfies Record<string, AttemptStatus>;

/** Statuses that permit signing in. */
export const SIGN_IN_ALLOWED_STATUSES: readonly UserStatus[] = [
  USER_STATUS.ACTIVE,
];

/** An attempt in any of these states is finished and immutable. */
export const TERMINAL_ATTEMPT_STATUSES: readonly AttemptStatus[] = [
  ATTEMPT_STATUS.SUBMITTED,
  ATTEMPT_STATUS.AUTO_SUBMITTED,
];

/** Human-readable labels for UI. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  teacher: "Teacher",
  student: "Student",
};

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  draft: "Draft",
  published: "Published",
  completed: "Completed",
};

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  in_progress: "In progress",
  submitted: "Submitted",
  auto_submitted: "Auto-submitted",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};
