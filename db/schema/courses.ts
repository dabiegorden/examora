import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * A subject a teacher assesses — the container for students and exams.
 *
 * `code` is unique per teacher rather than globally, so two teachers can both
 * run a course called "PHY101".
 */
export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    /** Free-form label such as "2025/2026". */
    academicYear: text("academic_year"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("courses_teacher_code_unique_idx").on(table.teacherId, table.code),
    index("courses_teacher_id_idx").on(table.teacherId),
    index("courses_is_archived_idx").on(table.isArchived),
    index("courses_created_at_idx").on(table.createdAt),
  ]
);
