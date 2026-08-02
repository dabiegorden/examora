import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { attempts } from "./attempts";
import { options } from "./options";
import { questions } from "./questions";

/**
 * A student's response to one question within an attempt.
 *
 * Rows are upserted as the student clicks (auto-save), keyed by the unique
 * `(attemptId, questionId)` index. `selectedOptionId` is nullable so a
 * deliberately skipped question is still recorded with its time spent.
 */
export const answers = pgTable(
  "answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    /**
     * `set null` rather than `cascade`: editing an option on a past paper must
     * not silently delete the evidence of what a student did.
     */
    selectedOptionId: uuid("selected_option_id").references(() => options.id, {
      onDelete: "set null",
    }),
    answeredAt: timestamp("answered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  },
  (table) => [
    uniqueIndex("answers_attempt_question_unique_idx").on(
      table.attemptId,
      table.questionId
    ),
    index("answers_attempt_id_idx").on(table.attemptId),
    index("answers_question_id_idx").on(table.questionId),
  ]
);
