import { and, eq, isNull, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { passwordResetTokens } from "@/db/schema";
import type { PasswordResetToken } from "@/types/db";

/**
 * Password reset tokens. As with sessions, every method takes a hash — the raw
 * token exists only in `AuthService.requestPasswordReset`'s return value.
 */
export const PasswordResetRepository = {
  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    requestedIp?: string | null;
  }): Promise<PasswordResetToken> {
    const [token] = await db
      .insert(passwordResetTokens)
      .values({
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        requestedIp: input.requestedIp ?? null,
      })
      .returning();

    return token;
  },

  /** A token that exists, has not been spent, and has not expired. */
  async findSpendable(tokenHash: string): Promise<PasswordResetToken | null> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!token) return null;
    return token.expiresAt > new Date() ? token : null;
  },

  /**
   * Spend a token.
   *
   * The `usedAt IS NULL` guard lives in the WHERE clause, so two requests racing
   * with the same link result in exactly one successful reset — the second
   * matches no row and gets `null` back.
   */
  async markUsed(tokenId: string): Promise<PasswordResetToken | null> {
    const [token] = await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(eq(passwordResetTokens.id, tokenId), isNull(passwordResetTokens.usedAt))
      )
      .returning();

    return token ?? null;
  },

  /**
   * Invalidate every outstanding token for a user.
   *
   * Called when a reset completes and when a password changes, so an old link
   * sitting in an inbox cannot undo a password the user just set.
   */
  async invalidateAllForUser(userId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt)
        )
      );
  },

  /** Housekeeping — drop rows that expired and were never spent. */
  async purgeExpired(): Promise<number> {
    const deleted = await db
      .delete(passwordResetTokens)
      .where(
        and(
          lte(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .returning({ id: passwordResetTokens.id });

    return deleted.length;
  },
};
