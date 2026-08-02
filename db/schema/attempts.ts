import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { attemptStatusEnum } from "./enums";
import { exams } from "./exams";
import { students } from "./students";

/**
 * One student's sitting of one exam.
 *
 * A student gets a single attempt per exam (enforced by the unique index), so
 * resuming after a dropped connection reuses this row rather than starting over.
 *
 * `tabSwitchCount` and `fullscreenExitCount` are denormalised running totals of
 * what `audit_logs` records in detail — cheap to read on a proctoring dashboard
 * without aggregating the log on every poll.
 */
export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: attemptStatusEnum("status").notNull().default("in_progress"),

    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),

    /** Marks awarded. Null until the attempt is graded. */
    score: integer("score"),
    /** Percentage of the paper's total marks, to two decimal places. */
    percentage: numeric("percentage", { precision: 5, scale: 2 }),

    tabSwitchCount: integer("tab_switch_count").notNull().default(0),
    fullscreenExitCount: integer("fullscreen_exit_count").notNull().default(0),
    /** Heartbeat used to detect abandoned sittings and drive auto-submission. */
    lastActivity: timestamp("last_activity", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("attempts_exam_student_unique_idx").on(table.examId, table.studentId),
    index("attempts_exam_id_idx").on(table.examId),
    index("attempts_student_id_idx").on(table.studentId),
    index("attempts_status_idx").on(table.status),
    index("attempts_started_at_idx").on(table.startedAt),
    /** Serves live monitoring: "who is still writing this exam". */
    index("attempts_exam_status_idx").on(table.examId, table.status),
  ]
);
