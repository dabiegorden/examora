// Not marked `server-only`: that specifier is supplied by the Next bundler and
// does not resolve under plain Node, which would make this layer untestable
// outside a request. The guard is still there — everything here reaches the
// database through `lib/env.ts`, which throws if it is ever evaluated in a
// browser. `lib/auth/dal.ts` keeps the `server-only` import as the hard
// compile-time boundary.
import { PasswordResetRepository, UserRepository } from "@/repositories";
import { createAuditLog } from "@/db/utils";
import { AUDIT_ACTION } from "@/constants/audit";
import {
  AccountDisabledError,
  InvalidCredentialsError,
  InvalidResetTokenError,
} from "@/lib/auth/errors";
import { createSession, deleteAllSessions, deleteSession } from "@/lib/auth/session";
import { generateSessionToken, hashToken } from "@/lib/auth/tokens";
import { hashPassword, verifyPassword } from "@/utils/password";
import { normalizeEmail } from "@/utils/text";
import type { User } from "@/types/db";

/**
 * Authentication use cases.
 *
 * Orchestrates repositories, password hashing, sessions, and the audit trail.
 * Server actions call these; they do not reimplement any of it.
 */

/** How long a reset link stays valid. Short, because it is a bearer credential. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * A hash of a password that cannot match anything, used to burn the same ~250ms
 * of bcrypt work when the email is unknown as when it exists.
 *
 * Without it, "no such user" returns in microseconds while a real account takes
 * a quarter second — a timing side channel that reveals which emails are
 * registered, exactly what the shared error message exists to hide.
 *
 * It must be a genuine cost-12 hash of an unknown value: bcrypt rejects a
 * malformed hash immediately, which would reintroduce the very timing gap this
 * closes. This one hashes 32 random bytes that were never recorded.
 */
const DUMMY_HASH = "$2b$12$/9PEUD4sXsTtuM.kqDAyG.UVd2faL4TfhmzvCDnbFpK670mogFUPy";

export interface SignInContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const AuthService = {
  /**
   * Verify credentials and start a session.
   *
   * Any failure raises `InvalidCredentialsError` with one message, so the form
   * cannot be used to discover which addresses have accounts. The one exception
   * is a disabled account: the password was correct, and telling that user to
   * contact their teacher is more useful than pretending the password was wrong.
   */
  async signIn(
    input: { email: string; password: string },
    context: SignInContext = {}
  ): Promise<User> {
    const email = normalizeEmail(input.email);
    const user = await UserRepository.findByEmail(email);

    const passwordMatches = await verifyPassword(
      input.password,
      user?.passwordHash ?? DUMMY_HASH
    );

    if (!user || !passwordMatches) {
      await createAuditLog({
        action: AUDIT_ACTION.LOGIN_FAILED,
        userId: user?.id ?? null,
        metadata: { email, reason: user ? "bad_password" : "unknown_email" },
      });

      throw new InvalidCredentialsError();
    }

    if (user.status !== "active") {
      await createAuditLog({
        action: AUDIT_ACTION.LOGIN_FAILED,
        userId: user.id,
        metadata: { email, reason: `account_${user.status}` },
      });

      throw new AccountDisabledError(user.status);
    }

    // Replaces any existing session — the single-device rule.
    await createSession({
      user,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    await UserRepository.touchLastLogin(user.id);
    await createAuditLog({
      action: AUDIT_ACTION.LOGIN,
      userId: user.id,
      metadata: { ipAddress: context.ipAddress ?? null },
    });

    return user;
  },

  async signOut(userId?: string): Promise<void> {
    await deleteSession();

    if (userId) {
      await createAuditLog({ action: AUDIT_ACTION.LOGOUT, userId });
    }
  },

  /**
   * Change a password for a signed-in user.
   *
   * Every other session is dropped and a fresh one issued. If the reason for
   * changing was a suspected compromise, leaving the attacker's session alive
   * would defeat the whole exercise.
   */
  async changePassword(
    user: User,
    input: { currentPassword: string; newPassword: string },
    context: SignInContext = {}
  ): Promise<void> {
    const matches = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!matches) throw new InvalidCredentialsError();

    await this.applyNewPassword(user, input.newPassword, context);
  },

  /**
   * First-login password change, where the current password was just proven at
   * sign-in and is a generated temporary one.
   */
  async setInitialPassword(
    user: User,
    newPassword: string,
    context: SignInContext = {}
  ): Promise<void> {
    await this.applyNewPassword(user, newPassword, context);
  },

  /**
   * Request a reset.
   *
   * Always resolves, whether or not the address exists — the caller shows the
   * same "check your inbox" message either way, so the form cannot enumerate
   * accounts. The raw token is returned for the delivery layer to send; it is
   * never persisted and never logged.
   */
  async requestPasswordReset(
    email: string,
    context: { ipAddress?: string | null } = {}
  ): Promise<{ token: string; user: User } | null> {
    const user = await UserRepository.findByEmail(normalizeEmail(email));
    if (!user || user.status !== "active") return null;

    // One live link at a time: issuing a new one retires the old.
    await PasswordResetRepository.invalidateAllForUser(user.id);

    const token = generateSessionToken();

    await PasswordResetRepository.create({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      requestedIp: context.ipAddress ?? null,
    });

    return { token, user };
  },

  /**
   * Complete a reset.
   *
   * The token is marked used *before* the password is written, and `markUsed`
   * only matches an unspent row — so two requests racing with the same link
   * cannot both succeed.
   */
  async resetPassword(input: {
    token: string;
    newPassword: string;
  }): Promise<User> {
    const record = await PasswordResetRepository.findSpendable(hashToken(input.token));
    if (!record) throw new InvalidResetTokenError();

    const spent = await PasswordResetRepository.markUsed(record.id);
    if (!spent) throw new InvalidResetTokenError();

    const user = await UserRepository.findById(record.userId);
    if (!user) throw new InvalidResetTokenError();

    await UserRepository.updatePassword(user.id, input.newPassword);
    await UserRepository.setMustChangePassword(user.id, false);

    // Whoever forced the reset should not keep any session they already had.
    await deleteAllSessions(user.id);

    return user;
  },

  /** Shared tail of every password write. */
  async applyNewPassword(
    user: User,
    newPassword: string,
    context: SignInContext
  ): Promise<void> {
    await UserRepository.updatePassword(user.id, newPassword);
    await UserRepository.setMustChangePassword(user.id, false);
    await PasswordResetRepository.invalidateAllForUser(user.id);

    // Drop every session, then re-issue one for this device so the user is not
    // bounced to /login immediately after succeeding.
    await deleteAllSessions(user.id);
    await createSession({
      user: { ...user, mustChangePassword: false },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  },
};

/** Re-exported so callers can hash without importing from two places. */
export { hashPassword };
