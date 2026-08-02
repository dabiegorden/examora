import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { courses, exams, options, questions } from "@/db/schema";
import { countExpression, findExam } from "@/db/utils";
import { EXAM_STATUS } from "@/constants/roles";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import type { Paginated, PaginationParams } from "@/types/common";
import type { Exam, ExamStatus, ExamWithQuestions } from "@/types/db";
import type { CreateExamInput, UpdateExamInput } from "@/validators/exam";

interface ListExamsParams extends PaginationParams {
  courseId?: string;
  status?: ExamStatus;
  search?: string;
}

/** An exam row with the totals a listing needs, without loading its questions. */
export interface ExamWithStats extends Exam {
  questionCount: number;
  totalMarks: number;
}

export const ExamRepository = {
  findById: findExam,

  async findByIdOrThrow(examId: string): Promise<Exam> {
    const exam = await findExam(examId);
    if (!exam) throw new NotFoundError("Exam", examId);
    return exam;
  },

  /** Ownership check that walks exam → course → teacher in one query. */
  async findOwnedOrThrow(examId: string, teacherId: string): Promise<Exam> {
    const [row] = await db
      .select({ exam: exams })
      .from(exams)
      .innerJoin(courses, eq(exams.courseId, courses.id))
      .where(and(eq(exams.id, examId), eq(courses.teacherId, teacherId)))
      .limit(1);

    if (!row) throw new NotFoundError("Exam", examId);
    return row.exam;
  },

  /**
   * The full paper: questions in authored order, each with its options.
   *
   * Uses the relational API so this is one round trip rather than an N+1 over
   * questions. Randomisation is applied by the exam engine per student, not
   * here — the teacher's editor needs the stable order.
   */
  async findWithQuestions(examId: string): Promise<ExamWithQuestions | null> {
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, examId),
      with: {
        questions: {
          orderBy: [asc(questions.order)],
          with: { options: { orderBy: [asc(options.order)] } },
        },
      },
    });

    return exam ?? null;
  },

  /**
   * The paper as a student should receive it: no `isCorrect` flags.
   *
   * Answer keys must never reach the client, so this projection is explicit
   * rather than a filtered copy of `findWithQuestions`.
   */
  async findForSitting(examId: string) {
    return db.query.exams.findFirst({
      where: eq(exams.id, examId),
      with: {
        questions: {
          orderBy: [asc(questions.order)],
          columns: { id: true, question: true, marks: true, order: true },
          with: {
            options: {
              orderBy: [asc(options.order)],
              columns: { id: true, text: true, order: true },
            },
          },
        },
      },
    });
  },

  async create(input: CreateExamInput): Promise<Exam> {
    const [exam] = await db
      .insert(exams)
      .values({
        courseId: input.courseId,
        title: input.title,
        instructions: input.instructions,
        startTime: input.startTime,
        endTime: input.endTime,
        overallDurationMinutes: input.overallDurationMinutes,
        questionDurationSeconds: input.questionDurationSeconds,
        randomizeQuestions: input.randomizeQuestions,
        randomizeOptions: input.randomizeOptions,
        allowReview: input.allowReview,
        allowResultsImmediately: input.allowResultsImmediately,
        fullscreenRequired: input.fullscreenRequired,
        autoSubmit: input.autoSubmit,
      })
      .returning();

    return exam;
  },

  /**
   * Edit a draft.
   *
   * Published and completed exams are frozen: changing the duration or the
   * question set while students are writing would invalidate attempts already
   * in flight.
   */
  async update(examId: string, teacherId: string, input: UpdateExamInput): Promise<Exam> {
    const existing = await this.findOwnedOrThrow(examId, teacherId);

    if (existing.status !== EXAM_STATUS.DRAFT) {
      throw new ConflictError("Only draft exams can be edited.");
    }

    const [exam] = await db
      .update(exams)
      .set(input)
      .where(eq(exams.id, examId))
      .returning();

    return exam;
  },

  /**
   * Move a draft to published.
   *
   * Refuses papers with no questions — a published empty exam is a paper every
   * student scores zero on, discovered only once they open it.
   */
  async publish(
    examId: string,
    teacherId: string,
    window: { startTime: Date; endTime: Date }
  ): Promise<Exam> {
    const existing = await this.findOwnedOrThrow(examId, teacherId);

    if (existing.status !== EXAM_STATUS.DRAFT) {
      throw new ConflictError("This exam has already been published.");
    }

    const questionCount = await db.$count(questions, eq(questions.examId, examId));
    if (Number(questionCount) === 0) {
      throw new ValidationError("Add at least one question before publishing.");
    }

    const [exam] = await db
      .update(exams)
      .set({
        status: EXAM_STATUS.PUBLISHED,
        startTime: window.startTime,
        endTime: window.endTime,
      })
      .where(eq(exams.id, examId))
      .returning();

    return exam;
  },

  async markCompleted(examId: string): Promise<Exam> {
    const [exam] = await db
      .update(exams)
      .set({ status: EXAM_STATUS.COMPLETED })
      .where(eq(exams.id, examId))
      .returning();

    if (!exam) throw new NotFoundError("Exam", examId);
    return exam;
  },

  async list(params: ListExamsParams = {}): Promise<Paginated<ExamWithStats>> {
    const pagination = normalizePagination(params);
    const search = params.search?.trim();

    const where = and(
      params.courseId ? eq(exams.courseId, params.courseId) : undefined,
      params.status ? eq(exams.status, params.status) : undefined,
      search ? ilike(exams.title, `%${search}%`) : undefined
    );

    // Aggregated via a LEFT JOIN + GROUP BY rather than correlated subqueries.
    // Drizzle only qualifies column names (`"questions"."marks"`) once it knows
    // a table is part of the query — inside a bare `sql` template it emits an
    // unqualified `"marks"`, which silently resolves against the wrong table.
    // The join keeps every reference unambiguous.
    const [rows, [totals]] = await Promise.all([
      db
        .select({
          exam: exams,
          questionCount: sql<number>`cast(count(${questions.id}) as int)`,
          totalMarks: sql<number>`cast(coalesce(sum(${questions.marks}), 0) as int)`,
        })
        .from(exams)
        .leftJoin(questions, eq(questions.examId, exams.id))
        .where(where)
        .groupBy(exams.id)
        .orderBy(desc(exams.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ count: countExpression }).from(exams).where(where),
    ]);

    return buildPaginated(
      rows.map((row) => ({
        ...row.exam,
        questionCount: Number(row.questionCount),
        totalMarks: Number(row.totalMarks),
      })),
      totals?.count ?? 0,
      pagination
    );
  },

  /** Sum of all question marks — the denominator when grading. */
  async getTotalMarks(examId: string): Promise<number> {
    const [row] = await db
      .select({
        total: sql<number>`cast(coalesce(sum(${questions.marks}), 0) as int)`,
      })
      .from(questions)
      .where(eq(questions.examId, examId));

    return Number(row?.total ?? 0);
  },

  async delete(examId: string, teacherId: string): Promise<void> {
    await this.findOwnedOrThrow(examId, teacherId);
    await db.delete(exams).where(eq(exams.id, examId));
  },
};
