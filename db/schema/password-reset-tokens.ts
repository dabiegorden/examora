import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Single-use password reset tokens.
 *
 * Only a SHA-256 hash of the token is stored. The raw value exists just twice:
 * in the reset link sent to the user, and briefly in memory while it is issued.
 * That way a stolen database cannot be turned into account takeovers.
 *
 * Rows are kept after use rather than deleted — `usedAt` is the evidence that a
 * reset happened, and re-presenting a spent token must fail rather than 404 in a
 * way that looks like it never existed.
 */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Null while the token is still spendable. */
    usedAt: timestamp("used_at", { withTimezone: true }),
    /** Recorded for abuse investigation, not for validation. */
    requestedIp: text("requested_ip"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_hash_unique_idx").on(table.tokenHash),
    index("password_reset_tokens_user_id_idx").on(table.userId),
    index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
  ]
);
