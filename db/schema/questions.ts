import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { exams } from "./exams";

/**
 * One multiple-choice question on a paper.
 *
 * `order` is the teacher's authored sequence. Per-student shuffling is applied
 * at delivery time when `exams.randomizeQuestions` is set, so this column stays
 * the stable reference the teacher sees in the editor and in analytics.
 */
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    marks: integer("marks").notNull().default(1),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("questions_exam_order_unique_idx").on(table.examId, table.order),
    index("questions_exam_id_idx").on(table.examId),
    index("questions_created_at_idx").on(table.createdAt),
  ]
);
