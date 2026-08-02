import { and, desc, eq, gte, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { auditLogs } from "@/db/schema";
import { countExpression, createAuditLog } from "@/db/utils";
import { VIOLATION_ACTIONS } from "@/constants/audit";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import type { Paginated, PaginationParams } from "@/types/common";
import type { AuditAction, AuditLog } from "@/types/db";

interface ListAuditLogsParams extends PaginationParams {
  userId?: string;
  examId?: string;
  action?: AuditAction;
  since?: Date;
}

export const AuditLogRepository = {
  /** Non-throwing append — see the note on `createAuditLog`. */
  record: createAuditLog,

  async list(params: ListAuditLogsParams = {}): Promise<Paginated<AuditLog>> {
    const pagination = normalizePagination(params);

    const where = and(
      params.userId ? eq(auditLogs.userId, params.userId) : undefined,
      params.examId ? eq(auditLogs.examId, params.examId) : undefined,
      params.action ? eq(auditLogs.action, params.action) : undefined,
      params.since ? gte(auditLogs.createdAt, params.since) : undefined
    );

    const [items, [totals]] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ count: countExpression }).from(auditLogs).where(where),
    ]);

    return buildPaginated(items, totals?.count ?? 0, pagination);
  },

  /**
   * Integrity events for one exam, newest first.
   *
   * This is the evidence a teacher reads when a result is disputed, so it is
   * scoped to violations rather than every login and answer change.
   */
  async listViolationsForExam(
    examId: string,
    params: PaginationParams = {}
  ): Promise<Paginated<AuditLog>> {
    const pagination = normalizePagination(params);

    const where = and(
      eq(auditLogs.examId, examId),
      inArray(auditLogs.action, [...VIOLATION_ACTIONS])
    );

    const [items, [totals]] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ count: countExpression }).from(auditLogs).where(where),
    ]);

    return buildPaginated(items, totals?.count ?? 0, pagination);
  },

  async countForUser(userId: string, action: AuditAction): Promise<number> {
    const [row] = await db
      .select({ count: countExpression })
      .from(auditLogs)
      .where(and(eq(auditLogs.userId, userId), eq(auditLogs.action, action)));

    return Number(row?.count ?? 0);
  },
};
