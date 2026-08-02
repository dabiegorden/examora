import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { questions } from "./questions";

/**
 * A selectable answer for a question.
 *
 * `isCorrect` is deliberately a plain boolean rather than a single
 * `correctOptionId` on the question, so multi-answer questions need no schema
 * change later.
 */
export const options = pgTable(
  "options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    /** Authored position (A, B, C, D). Shuffled per student at delivery time. */
    order: integer("order").notNull().default(0),
  },
  (table) => [index("options_question_id_idx").on(table.questionId)]
);
