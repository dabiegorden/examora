import { AppError } from "@/lib/errors";

/**
 * Authentication failures.
 *
 * `InvalidCredentialsError` is deliberately the *only* error returned for a bad
 * email or a bad password. Distinguishing them turns the login form into an
 * account-enumeration oracle: "no such user" confirms which addresses exist.
 */
export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Incorrect email or password.", "UNAUTHORIZED", 401);
  }
}

/** The account exists and the password was right, but sign-in is not permitted. */
export class AccountDisabledError extends AppError {
  constructor(reason: "inactive" | "suspended") {
    super(
      reason === "suspended"
        ? "This account has been suspended. Contact your teacher."
        : "This account is not active. Contact your teacher.",
      "FORBIDDEN",
      403
    );
  }
}

/** The cookie was valid but the matching database session is gone or expired. */
export class SessionExpiredError extends AppError {
  constructor(
    message = "Your session has ended. Please sign in again."
  ) {
    super(message, "UNAUTHORIZED", 401);
  }
}

/** Signed in, but the wrong role for this resource. */
export class RoleNotPermittedError extends AppError {
  constructor() {
    super("You do not have access to this area.", "FORBIDDEN", 403);
  }
}

/** A reset link that is unknown, already spent, or past its expiry. */
export class InvalidResetTokenError extends AppError {
  constructor() {
    super(
      "This reset link is invalid or has expired. Request a new one.",
      "UNAUTHORIZED",
      401
    );
  }
}

/**
 * Reasons a session ended, carried to /login as a query param so the page can
 * explain itself. `replaced` is the single-device case, and it matters that the
 * user is told rather than left wondering why they were logged out.
 */
export const SIGN_OUT_REASON = {
  EXPIRED: "expired",
  REPLACED: "replaced",
  DISABLED: "disabled",
  FORBIDDEN: "forbidden",
} as const;

export type SignOutReason = (typeof SIGN_OUT_REASON)[keyof typeof SIGN_OUT_REASON];

export const SIGN_OUT_MESSAGES: Record<SignOutReason, string> = {
  expired: "Your session has ended. Please sign in again.",
  replaced: "You were signed out because your account was used on another device.",
  disabled: "This account is no longer active. Contact your teacher.",
  forbidden: "You do not have access to that area.",
};
