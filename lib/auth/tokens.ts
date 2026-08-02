import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";
import type { UserRole } from "@/types/db";

/**
 * Token and cookie cryptography.
 *
 * Two separate ideas live here, and conflating them is the classic session bug:
 *
 * 1. The **session token** is a 256-bit random secret. The client holds it; the
 *    database holds only `sha256(token)`. A leaked dump therefore yields no
 *    usable logins.
 *
 * 2. The **cookie value** wraps that token together with the role, signed with
 *    HMAC-SHA256. The signature lets `proxy.ts` make a role-based routing
 *    decision without a database round trip on every prefetch, while the
 *    database session stays the only real source of truth (see `lib/auth/dal.ts`).
 *    Nothing here is encryption — the payload is readable, just not forgeable.
 */

const TOKEN_BYTES = 32;

/** A fresh, unguessable session token. Returned to the client exactly once. */
export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** One-way digest used for both session and password-reset token storage. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionCookiePayload {
  /** The raw session token — hashed before it is compared to the database. */
  token: string;
  role: UserRole;
  /** Epoch milliseconds. A cheap pre-check; the database row is authoritative. */
  expiresAt: number;
}

function sign(value: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
}

/** Constant-time comparison, so a wrong signature leaks nothing through timing. */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Serialise a payload into `<base64url-json>.<signature>`. */
export function encodeSessionCookie(payload: SessionCookiePayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/**
 * Verify and parse a cookie value.
 *
 * Returns `null` for anything unusable — tampered, truncated, wrong secret, or
 * past its own expiry. Callers treat null as "no session" rather than an error;
 * a malformed cookie is what an attacker sends, not an exceptional condition.
 */
export function decodeSessionCookie(raw: string | undefined): SessionCookiePayload | null {
  if (!raw) return null;

  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const body = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  if (!signaturesMatch(sign(body), signature)) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as SessionCookiePayload).token !== "string" ||
      typeof (parsed as SessionCookiePayload).expiresAt !== "number"
    ) {
      return null;
    }

    const payload = parsed as SessionCookiePayload;
    if (payload.role !== "teacher" && payload.role !== "student") return null;
    if (payload.expiresAt <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * A readable temporary password for provisioned accounts.
 *
 * Ambiguous glyphs (0/O, 1/l/I) are excluded because these get read aloud or
 * copied off a printed list. It always satisfies `passwordSchema`: one block of
 * letters capitalised, digits, and a symbol.
 */
export function generateTemporaryPassword(): string {
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";

  const pick = (alphabet: string, count: number): string => {
    const bytes = randomBytes(count);
    let out = "";
    for (let i = 0; i < count; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  };

  return `${pick(upper, 1)}${pick(lower, 5)}-${pick(digits, 4)}`;
}
