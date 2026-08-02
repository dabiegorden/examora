import { cookies } from "next/headers";

import { env } from "@/lib/env";
import { SESSION_TTL_MS } from "@/constants/app";
import {
  decodeSessionCookie,
  encodeSessionCookie,
  type SessionCookiePayload,
} from "./tokens";

/**
 * The session cookie.
 *
 * `__Host-` in production is not decoration: the prefix makes the browser refuse
 * the cookie unless it is Secure, path `/`, and has no Domain attribute, which
 * blocks a subdomain from overwriting it. The prefix requires HTTPS, so plain
 * `examora_session` is used in development.
 */
export const SESSION_COOKIE_NAME = env.NODE_ENV === "production"
  ? "__Host-examora_session"
  : "examora_session";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
} as const;

export async function setSessionCookie(payload: SessionCookiePayload): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE_NAME, encodeSessionCookie(payload), {
    ...cookieOptions,
    // Anchored to the session's own expiry, so the cookie and the database row
    // die together rather than leaving a cookie that always fails validation.
    expires: new Date(payload.expiresAt),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();

  // Overwrite with an already-expired cookie rather than only calling delete():
  // the attributes must match for every browser to actually drop it.
  store.set(SESSION_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  store.delete(SESSION_COOKIE_NAME);
}

/** The verified cookie payload, or null when absent, tampered with, or stale. */
export async function readSessionCookie(): Promise<SessionCookiePayload | null> {
  const store = await cookies();
  return decodeSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
}

export function defaultSessionExpiry(): number {
  return Date.now() + SESSION_TTL_MS;
}
