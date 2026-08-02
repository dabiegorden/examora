import { SessionRepository, UserRepository } from "@/repositories";
import { SESSION_TTL_MS } from "@/constants/app";
import type { ActiveSession, User } from "@/types/db";
import {
  clearSessionCookie,
  defaultSessionExpiry,
  readSessionCookie,
  setSessionCookie,
} from "./cookies";
import { generateSessionToken, hashToken } from "./tokens";

/**
 * Session lifecycle.
 *
 * The only module that handles raw session tokens. Everything below it works in
 * hashes; everything above it works in `User` objects.
 */

export interface ValidatedSession {
  session: ActiveSession;
  user: User;
}

/**
 * Issue a session and set the cookie.
 *
 * Replaces any existing session for the user in the same call — that is the
 * single-device rule, and making it the *only* way to create a session means no
 * future code path can accidentally leave two sessions alive.
 */
export async function createSession(input: {
  user: User;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<ActiveSession> {
  const token = generateSessionToken();
  const expiresAt = defaultSessionExpiry();

  const session = await SessionRepository.replaceForUser({
    userId: input.user.id,
    tokenHash: hashToken(token),
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    expiresAt: new Date(expiresAt),
  });

  await setSessionCookie({ token, role: input.user.role, expiresAt });

  return session;
}

/** Explicit alias for the single-device behaviour `createSession` already has. */
export const replaceExistingSession = createSession;

/**
 * The session row for the current request, without loading the user.
 *
 * Returns null when the cookie is missing, forged, or points at a session that
 * has been deleted — the last case being exactly what a signed-out-elsewhere
 * device sees.
 */
export async function getSession(): Promise<ActiveSession | null> {
  const payload = await readSessionCookie();
  if (!payload) return null;

  return SessionRepository.findValidByTokenHash(hashToken(payload.token));
}

/**
 * Full validation: session row plus its user.
 *
 * The cookie's `role` claim is never trusted here; the role is re-read from the
 * user row. The claim exists only so `proxy.ts` can route optimistically.
 */
export async function validateSession(): Promise<ValidatedSession | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await UserRepository.findById(session.userId);

  // The account was deleted or deactivated while the session was live. Drop the
  // session rather than letting a suspended user keep working until expiry.
  if (!user || user.status !== "active") {
    await SessionRepository.revokeAllForUser(session.userId);
    return null;
  }

  return { session, user };
}

/**
 * Slide the expiry forward when a session is more than halfway through its life.
 *
 * Only past the halfway mark, so an active user does not cause a write on every
 * request.
 *
 * The database row is always extended. Refreshing the *cookie* is best-effort:
 * this runs from `getCurrentUser`, which is called during page rendering, and
 * Next.js only permits `cookies().set()` inside a Server Action or Route
 * Handler. Throwing there would turn every page view near the halfway mark into
 * a 500, so the write is attempted and the "wrong context" error swallowed — the
 * cookie then picks up its new expiry on the next action the user performs.
 */
export async function refreshSessionIfNeeded(
  validated: ValidatedSession
): Promise<void> {
  const remaining = validated.session.expiresAt.getTime() - Date.now();
  if (remaining > SESSION_TTL_MS / 2) return;

  const payload = await readSessionCookie();
  if (!payload) return;

  const expiresAt = await SessionRepository.extend(hashToken(payload.token));

  try {
    await setSessionCookie({
      token: payload.token,
      role: validated.user.role,
      expiresAt: expiresAt.getTime(),
    });
  } catch {
    // Read-only render context. The database expiry moved, which is what keeps
    // the session alive; the cookie catches up on the next mutation.
  }
}

/** End the current session: remove the row, then clear the cookie. */
export async function deleteSession(): Promise<void> {
  const payload = await readSessionCookie();

  if (payload) {
    await SessionRepository.revokeByTokenHash(hashToken(payload.token));
  }

  await clearSessionCookie();
}

/** End every session a user holds — used on password change and reset. */
export async function deleteAllSessions(userId: string): Promise<void> {
  await SessionRepository.revokeAllForUser(userId);
}
