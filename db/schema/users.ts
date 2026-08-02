import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { userRoleEnum, userStatusEnum } from "./enums";

/**
 * Every human who can sign in — teachers and students alike.
 *
 * Student-specific data (their student number) lives in `students`, keyed off
 * this row, so the sign-in surface stays one table.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    /** Always stored lower-cased — see `normalizeEmail` in `utils/text.ts`. */
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    status: userStatusEnum("status").notNull().default("active"),
    /**
     * Set when an account is provisioned with a generated password. The signed-in
     * user is confined to the change-password screen until they clear it, so a
     * temporary password issued over a side channel can never become permanent.
     */
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.status),
    index("users_created_at_idx").on(table.createdAt),
  ]
);
