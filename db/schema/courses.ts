import { sql } from "drizzle-orm";
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
 *
 * Courses are never hard-deleted: exams, attempts, and results hang off them,
 * and losing a course would silently take a term of assessment history with it.
 * `deletedAt` is the tombstone, and every read filters on it.
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
    /** Set when the teacher deletes the course. Non-null means "gone". */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Partial, so deleting "PHY101" frees the code for a new course. A plain
    // unique index would let a tombstone block a title the teacher can no
    // longer see, which reads as an unexplainable error.
    uniqueIndex("courses_teacher_code_unique_idx")
      .on(table.teacherId, table.code)
      .where(sql`${table.deletedAt} is null`),
    index("courses_teacher_id_idx").on(table.teacherId),
    index("courses_is_archived_idx").on(table.isArchived),
    index("courses_deleted_at_idx").on(table.deletedAt),
    index("courses_created_at_idx").on(table.createdAt),
  ]
);
