import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Live sign-in sessions, backing the single-device rule.
 *
 * `userId` is intentionally *not* unique: expired rows are kept until swept, so
 * a user may briefly own several. "One active session" is enforced by
 * `SessionRepository.replaceForUser`, which revokes existing rows inside the
 * same transaction as the new sign-in.
 *
 * The table stores a **hash** of the session token, never the token itself, so
 * a leaked database dump cannot be replayed as a set of live logins. Renamed
 * from `session_token` in the auth phase precisely so the column cannot be
 * mistaken for something you can compare a cookie against directly.
 */
export const activeSessions = pgTable(
  "active_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 of the opaque token held by the client. Never the raw token. */
    tokenHash: text("token_hash").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("active_sessions_token_unique_idx").on(table.tokenHash),
    index("active_sessions_user_id_idx").on(table.userId),
    index("active_sessions_expires_at_idx").on(table.expiresAt),
  ]
);
