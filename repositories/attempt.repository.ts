import { and, desc, eq, lt, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { answers, attempts, students, users } from "@/db/schema";
import { countExpression, findAttempt, findAttemptForStudent } from "@/db/utils";
import { ATTEMPT_STATUS, TERMINAL_ATTEMPT_STATUSES } from "@/constants/roles";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import { toPercentage } from "@/utils/text";
import type { Paginated, PaginationParams } from "@/types/common";
import type {
  Answer,
  Attempt,
  AttemptStatus,
  AttemptWithAnswers,
  AttemptWithStudent,
} from "@/types/db";

export const AttemptRepository = {
  findById: findAttempt,
  findForStudent: findAttemptForStudent,

  async findByIdOrThrow(attemptId: string): Promise<Attempt> {
    const attempt = await findAttempt(attemptId);
    if (!attempt) throw new NotFoundError("Attempt", attemptId);
    return attempt;
  },

  async findWithAnswers(attemptId: string): Promise<AttemptWithAnswers | null> {
    const attempt = await db.query.attempts.findFirst({
      where: eq(attempts.id, attemptId),
      with: { answers: true },
    });

    return attempt ?? null;
  },

  /**
   * Start an attempt, or return the one already in progress.
   *
   * Resuming rather than restarting is the point: a student whose laptop died
   * mid-paper must come back to the same attempt, with their saved answers and
   * the clock still running from the original `startedAt`.
   */
  async startOrResume(examId: string, studentId: string): Promise<Attempt> {
    const existing = await findAttemptForStudent(examId, studentId);

    if (existing) {
      if (TERMINAL_ATTEMPT_STATUSES.includes(existing.status)) {
        throw new ConflictError("You have already submitted this exam.");
      }

      return this.touch(existing.id);
    }

    const [attempt] = await db
      .insert(attempts)
      .values({ examId, studentId, status: ATTEMPT_STATUS.IN_PROGRESS })
      .returning();

    return attempt;
  },

  /** Heartbeat. Also what the stale-attempt sweeper reads. */
  async touch(attemptId: string): Promise<Attempt> {
    const [attempt] = await db
      .update(attempts)
      .set({ lastActivity: new Date() })
      .where(eq(attempts.id, attemptId))
      .returning();

    if (!attempt) throw new NotFoundError("Attempt", attemptId);
    return attempt;
  },

  /**
   * Save one answer.
   *
   * Upsert on `(attemptId, questionId)`, so the student changing their mind
   * overwrites rather than accumulating rows. `lastActivity` moves in the same
   * batch — auto-save and heartbeat are the same event.
   */
  async saveAnswer(input: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string | null;
    timeSpentSeconds?: number;
  }): Promise<Answer> {
    const now = new Date();

    const [answer] = await db
      .insert(answers)
      .values({
        attemptId: input.attemptId,
        questionId: input.questionId,
        selectedOptionId: input.selectedOptionId,
        timeSpentSeconds: input.timeSpentSeconds ?? 0,
        answeredAt: now,
      })
      .onConflictDoUpdate({
        target: [answers.attemptId, answers.questionId],
        set: {
          selectedOptionId: input.selectedOptionId,
          timeSpentSeconds: input.timeSpentSeconds ?? 0,
          answeredAt: now,
        },
      })
      .returning();

    await db
      .update(attempts)
      .set({ lastActivity: now })
      .where(eq(attempts.id, input.attemptId));

    return answer;
  },

  async listAnswers(attemptId: string): Promise<Answer[]> {
    return db.select().from(answers).where(eq(answers.attemptId, attemptId));
  },

  /**
   * Record a proctoring violation.
   *
   * Incremented in SQL rather than read-modify-written in JS: two tab switches
   * a few milliseconds apart would otherwise race and lose a count.
   */
  async recordViolation(
    attemptId: string,
    kind: "tab_switch" | "fullscreen_exit"
  ): Promise<Attempt> {
    const column =
      kind === "tab_switch" ? attempts.tabSwitchCount : attempts.fullscreenExitCount;

    const [attempt] = await db
      .update(attempts)
      .set({
        [kind === "tab_switch" ? "tabSwitchCount" : "fullscreenExitCount"]: sql`${column} + 1`,
        lastActivity: new Date(),
      })
      .where(eq(attempts.id, attemptId))
      .returning();

    if (!attempt) throw new NotFoundError("Attempt", attemptId);
    return attempt;
  },

  /**
   * Finalise an attempt with its grade.
   *
   * The status guard is in the `where` clause, not a prior read: two concurrent
   * submissions (the student clicking Submit as the timer fires) both reach
   * here, and only the first matches an `in_progress` row.
   */
  async submit(input: {
    attemptId: string;
    score: number;
    totalMarks: number;
    auto?: boolean;
  }): Promise<Attempt> {
    const status = input.auto
      ? ATTEMPT_STATUS.AUTO_SUBMITTED
      : ATTEMPT_STATUS.SUBMITTED;

    const [attempt] = await db
      .update(attempts)
      .set({
        status,
        score: input.score,
        percentage: toPercentage(input.score, input.totalMarks).toFixed(2),
        submittedAt: new Date(),
        lastActivity: new Date(),
      })
      .where(
        and(
          eq(attempts.id, input.attemptId),
          eq(attempts.status, ATTEMPT_STATUS.IN_PROGRESS)
        )
      )
      .returning();

    if (!attempt) {
      throw new ConflictError("This attempt has already been submitted.");
    }

    return attempt;
  },

  /** Live monitoring: who is writing this exam, and how they are behaving. */
  async listByExam(
    examId: string,
    params: PaginationParams & { status?: AttemptStatus } = {}
  ): Promise<Paginated<AttemptWithStudent>> {
    const pagination = normalizePagination(params);

    const where = and(
      eq(attempts.examId, examId),
      params.status ? eq(attempts.status, params.status) : undefined
    );

    const [rows, [totals]] = await Promise.all([
      db
        .select({ attempt: attempts, student: students, user: users })
        .from(attempts)
        .innerJoin(students, eq(attempts.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .where(where)
        .orderBy(desc(attempts.startedAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ count: countExpression }).from(attempts).where(where),
    ]);

    return buildPaginated(
      rows.map((row) => ({
        ...row.attempt,
        student: { ...row.student, user: row.user },
      })),
      totals?.count ?? 0,
      pagination
    );
  },

  async listByStudent(studentId: string): Promise<Attempt[]> {
    return db
      .select()
      .from(attempts)
      .where(eq(attempts.studentId, studentId))
      .orderBy(desc(attempts.startedAt));
  },

  /**
   * In-progress attempts whose heartbeat has gone quiet — the queue the
   * auto-submission sweeper drains.
   */
  async findStale(staleBefore: Date): Promise<Attempt[]> {
    return db
      .select()
      .from(attempts)
      .where(
        and(
          eq(attempts.status, ATTEMPT_STATUS.IN_PROGRESS),
          lt(attempts.lastActivity, staleBefore)
        )
      );
  },

  /** Score distribution for an exam, for the analytics view. */
  async getExamStats(examId: string) {
    const [row] = await db
      .select({
        total: countExpression,
        submitted: sql<number>`cast(count(*) filter (
          where ${attempts.status} <> ${ATTEMPT_STATUS.IN_PROGRESS}
        ) as int)`,
        averagePercentage: sql<string | null>`avg(${attempts.percentage})`,
        highestScore: sql<number | null>`max(${attempts.score})`,
        lowestScore: sql<number | null>`min(${attempts.score})`,
      })
      .from(attempts)
      .where(eq(attempts.examId, examId));

    return {
      total: Number(row?.total ?? 0),
      submitted: Number(row?.submitted ?? 0),
      averagePercentage: row?.averagePercentage
        ? Number(Number(row.averagePercentage).toFixed(2))
        : 0,
      highestScore: row?.highestScore ?? 0,
      lowestScore: row?.lowestScore ?? 0,
    };
  },
};
