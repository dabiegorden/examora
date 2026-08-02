import { index, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { auditActionEnum } from "./enums";
import { exams } from "./exams";
import { users } from "./users";

/**
 * Append-only trail of everything that matters to exam integrity.
 *
 * Both foreign keys are `set null` on delete: a log entry outlives the user or
 * exam it describes, otherwise removing an account would erase the evidence of
 * what that account did.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    examId: uuid("exam_id").references(() => exams.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    /** Action-specific context, e.g. `{ questionId, fromOptionId, toOptionId }`. */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_exam_id_idx").on(table.examId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
    /** Serves the per-exam integrity report, newest first. */
    index("audit_logs_exam_created_at_idx").on(table.examId, table.createdAt),
  ]
);
