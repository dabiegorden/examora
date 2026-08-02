import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * The student profile attached to a user account.
 *
 * One-to-one with `users` (enforced by the unique index on `userId`). Deleting
 * the account removes the profile; enrolments and attempts cascade from here.
 */
export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Institution-issued identifier, e.g. "EXM-2026-014". Unique across the tenant. */
    studentNumber: text("student_number").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("students_user_id_unique_idx").on(table.userId),
    uniqueIndex("students_student_number_unique_idx").on(table.studentNumber),
    index("students_created_at_idx").on(table.createdAt),
  ]
);
