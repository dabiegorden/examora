import { and, eq, gt, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { activeSessions } from "@/db/schema";
import { SESSION_TTL_MS } from "@/constants/app";
import type { ActiveSession } from "@/types/db";

/**
 * Session rows.
 *
 * Every method takes a **token hash**, never a raw token — hashing happens in
 * `lib/auth/session.ts`, which is the only place that ever sees the raw value.
 */
export const SessionRepository = {
  /**
   * Sign a user in on this device, ending every other session they hold.
   *
   * This is the single-device rule. Delete and insert go out as one `db.batch`,
   * which Neon runs as a transaction, so there is no instant where the user has
   * either two live sessions or none.
   */
  async replaceForUser(input: {
    userId: string;
    tokenHash: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    expiresAt: Date;
  }): Promise<ActiveSession> {
    const [, inserted] = await db.batch([
      db.delete(activeSessions).where(eq(activeSessions.userId, input.userId)),
      db
        .insert(activeSessions)
        .values({
          userId: input.userId,
          tokenHash: input.tokenHash,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          expiresAt: input.expiresAt,
        })
        .returning(),
    ]);

    return inserted[0];
  },

  /** Look up a session, treating an expired row as absent. */
  async findValidByTokenHash(tokenHash: string): Promise<ActiveSession | null> {
    const [session] = await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.tokenHash, tokenHash),
          gt(activeSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return session ?? null;
  },

  async listForUser(userId: string): Promise<ActiveSession[]> {
    return db.select().from(activeSessions).where(eq(activeSessions.userId, userId));
  },

  /** Extend a session's life on activity, so an active user is never logged out. */
  async extend(tokenHash: string, ttlMs = SESSION_TTL_MS): Promise<Date> {
    const expiresAt = new Date(Date.now() + ttlMs);

    await db
      .update(activeSessions)
      .set({ expiresAt })
      .where(eq(activeSessions.tokenHash, tokenHash));

    return expiresAt;
  },

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await db.delete(activeSessions).where(eq(activeSessions.tokenHash, tokenHash));
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await db.delete(activeSessions).where(eq(activeSessions.userId, userId));
  },

  /** Housekeeping for a scheduled job — drop rows that are already expired. */
  async purgeExpired(): Promise<number> {
    const deleted = await db
      .delete(activeSessions)
      .where(lte(activeSessions.expiresAt, new Date()))
      .returning({ id: activeSessions.id });

    return deleted.length;
  },
};
