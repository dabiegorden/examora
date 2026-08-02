import type { AuditAction } from "@/types/db";

/** Audit action names, typed against the Postgres enum. */
export const AUDIT_ACTION = {
  LOGIN: "LOGIN",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  SESSION_REVOKED: "SESSION_REVOKED",
  EXAM_PUBLISHED: "EXAM_PUBLISHED",
  EXAM_STARTED: "EXAM_STARTED",
  QUESTION_ANSWERED: "QUESTION_ANSWERED",
  TAB_SWITCH: "TAB_SWITCH",
  FULLSCREEN_EXIT: "FULLSCREEN_EXIT",
  EXAM_SUBMITTED: "EXAM_SUBMITTED",
  AUTO_SUBMITTED: "AUTO_SUBMITTED",
} as const satisfies Record<string, AuditAction>;

/**
 * Actions that count as an integrity violation. Used to flag attempts for
 * teacher review without re-listing these strings at every call site.
 */
export const VIOLATION_ACTIONS: readonly AuditAction[] = [
  AUDIT_ACTION.TAB_SWITCH,
  AUDIT_ACTION.FULLSCREEN_EXIT,
];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: "Signed in",
  LOGIN_FAILED: "Failed sign-in",
  LOGOUT: "Signed out",
  SESSION_REVOKED: "Session revoked",
  EXAM_PUBLISHED: "Exam published",
  EXAM_STARTED: "Exam started",
  QUESTION_ANSWERED: "Question answered",
  TAB_SWITCH: "Switched tab",
  FULLSCREEN_EXIT: "Left fullscreen",
  EXAM_SUBMITTED: "Exam submitted",
  AUTO_SUBMITTED: "Auto-submitted",
};
