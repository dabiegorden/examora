import { and, eq, gt, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { activeSessions } from "@/db/schema";
import { SESSION_TTL_MS } from "@/constants/app";
import type { ActiveSession } from "@/types/db";

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
    sessionToken: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    ttlMs?: number;
  }): Promise<ActiveSession> {
    const expiresAt = new Date(Date.now() + (input.ttlMs ?? SESSION_TTL_MS));

    const [, inserted] = await db.batch([
      db.delete(activeSessions).where(eq(activeSessions.userId, input.userId)),
      db
        .insert(activeSessions)
        .values({
          userId: input.userId,
          sessionToken: input.sessionToken,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          expiresAt,
        })
        .returning(),
    ]);

    return inserted[0];
  },

  /** Look up a session, treating an expired row as absent. */
  async findValidByToken(sessionToken: string): Promise<ActiveSession | null> {
    const [session] = await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.sessionToken, sessionToken),
          gt(activeSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return session ?? null;
  },

  async listForUser(userId: string): Promise<ActiveSession[]> {
    return db
      .select()
      .from(activeSessions)
      .where(eq(activeSessions.userId, userId));
  },

  /** Extend a session's life on activity, so an active user is never logged out. */
  async extend(sessionToken: string, ttlMs = SESSION_TTL_MS): Promise<void> {
    await db
      .update(activeSessions)
      .set({ expiresAt: new Date(Date.now() + ttlMs) })
      .where(eq(activeSessions.sessionToken, sessionToken));
  },

  async revokeByToken(sessionToken: string): Promise<void> {
    await db
      .delete(activeSessions)
      .where(eq(activeSessions.sessionToken, sessionToken));
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
