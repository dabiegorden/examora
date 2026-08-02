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
 */
export const activeSessions = pgTable(
  "active_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Opaque random token. Store a hash here once auth lands. */
    sessionToken: text("session_token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("active_sessions_token_unique_idx").on(table.sessionToken),
    index("active_sessions_user_id_idx").on(table.userId),
    index("active_sessions_expires_at_idx").on(table.expiresAt),
  ]
);
