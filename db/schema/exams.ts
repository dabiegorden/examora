import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { courses } from "./courses";
import { examStatusEnum } from "./enums";

/**
 * A single examination paper plus the rules it runs under.
 *
 * The boolean columns are the anti-cheating and experience switches surfaced to
 * the teacher when they publish. Defaults describe a sensible secure exam:
 * randomised, fullscreen, auto-submitting, results withheld until released.
 */
export const exams = pgTable(
  "exams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    instructions: text("instructions"),
    status: examStatusEnum("status").notNull().default("draft"),

    /** Sitting window. Null until the teacher schedules the exam. */
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),

    /** Total time allowed per attempt. */
    overallDurationMinutes: integer("overall_duration_minutes").notNull().default(60),
    /** Optional per-question cap. Null means only the overall timer applies. */
    questionDurationSeconds: integer("question_duration_seconds"),

    randomizeQuestions: boolean("randomize_questions").notNull().default(true),
    randomizeOptions: boolean("randomize_options").notNull().default(true),
    /** Whether students may revisit answered questions before submitting. */
    allowReview: boolean("allow_review").notNull().default(true),
    allowResultsImmediately: boolean("allow_results_immediately")
      .notNull()
      .default(false),
    fullscreenRequired: boolean("fullscreen_required").notNull().default(true),
    autoSubmit: boolean("auto_submit").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("exams_course_id_idx").on(table.courseId),
    index("exams_status_idx").on(table.status),
    index("exams_created_at_idx").on(table.createdAt),
    index("exams_start_time_idx").on(table.startTime),
    /** Serves the common "published exams in this course" listing. */
    index("exams_course_status_idx").on(table.courseId, table.status),
  ]
);
