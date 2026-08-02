import { index, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";

import { courses } from "./courses";
import { students } from "./students";

/**
 * Enrolment join table between `courses` and `students`.
 *
 * The composite primary key makes double-enrolment impossible at the database
 * level, so bulk imports can be re-run safely.
 */
export const courseStudents = pgTable(
  "course_students",
  {
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.courseId, table.studentId] }),
    index("course_students_course_id_idx").on(table.courseId),
    index("course_students_student_id_idx").on(table.studentId),
  ]
);
