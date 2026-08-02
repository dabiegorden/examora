import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { options, questions } from "@/db/schema";
import { NotFoundError } from "@/lib/errors";
import type { Option, Question, QuestionWithOptions } from "@/types/db";
import type { OptionDraftInput } from "@/validators/option";

interface QuestionDraft {
  question: string;
  marks: number;
  options: OptionDraftInput[];
}

export const QuestionRepository = {
  async findById(questionId: string): Promise<Question | null> {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    return question ?? null;
  },

  async findByIdOrThrow(questionId: string): Promise<Question> {
    const question = await this.findById(questionId);
    if (!question) throw new NotFoundError("Question", questionId);
    return question;
  },

  async findWithOptions(questionId: string): Promise<QuestionWithOptions | null> {
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      with: { options: { orderBy: [asc(options.order)] } },
    });

    return question ?? null;
  },

  async listByExam(examId: string): Promise<QuestionWithOptions[]> {
    return db.query.questions.findMany({
      where: eq(questions.examId, examId),
      orderBy: [asc(questions.order)],
      with: { options: { orderBy: [asc(options.order)] } },
    });
  },

  /** The correct option ids for a paper, keyed by question — the grading key. */
  async getAnswerKey(examId: string): Promise<Map<string, Set<string>>> {
    const rows = await db
      .select({ questionId: questions.id, optionId: options.id })
      .from(questions)
      .innerJoin(options, eq(options.questionId, questions.id))
      .where(and(eq(questions.examId, examId), eq(options.isCorrect, true)));

    const key = new Map<string, Set<string>>();
    for (const row of rows) {
      const existing = key.get(row.questionId) ?? new Set<string>();
      existing.add(row.optionId);
      key.set(row.questionId, existing);
    }

    return key;
  },

  /** Next free `order` value, so appending never collides with the unique index. */
  async nextOrder(examId: string): Promise<number> {
    const [row] = await db
      .select({ max: sql<number>`cast(coalesce(max(${questions.order}), -1) as int)` })
      .from(questions)
      .where(eq(questions.examId, examId));

    return Number(row?.max ?? -1) + 1;
  },

  /**
   * Create a question with its options.
   *
   * Two round trips, because the option rows need the generated question id and
   * `db.batch` cannot feed one statement's output into the next. Validate with
   * `createQuestionSchema` first — it rejects an empty or keyless option set, so
   * the second insert is not where bad input gets caught.
   */
  async create(
    examId: string,
    draft: QuestionDraft,
    order?: number
  ): Promise<QuestionWithOptions> {
    const resolvedOrder = order ?? (await this.nextOrder(examId));

    const [question] = await db
      .insert(questions)
      .values({
        examId,
        question: draft.question,
        marks: draft.marks,
        order: resolvedOrder,
      })
      .returning();

    const insertedOptions = await db
      .insert(options)
      .values(
        draft.options.map((option, index) => ({
          questionId: question.id,
          text: option.text,
          isCorrect: option.isCorrect,
          order: index,
        }))
      )
      .returning();

    return { ...question, options: insertedOptions };
  },

  /** Bulk path for imports — one insert for the questions, one for all options. */
  async createMany(
    examId: string,
    drafts: readonly QuestionDraft[],
    startOrder?: number
  ): Promise<QuestionWithOptions[]> {
    if (drafts.length === 0) return [];

    const base = startOrder ?? (await this.nextOrder(examId));

    const insertedQuestions = await db
      .insert(questions)
      .values(
        drafts.map((draft, index) => ({
          examId,
          question: draft.question,
          marks: draft.marks,
          order: base + index,
        }))
      )
      .returning();

    const optionValues = insertedQuestions.flatMap((question, questionIndex) =>
      drafts[questionIndex].options.map((option, optionIndex) => ({
        questionId: question.id,
        text: option.text,
        isCorrect: option.isCorrect,
        order: optionIndex,
      }))
    );

    const insertedOptions = await db.insert(options).values(optionValues).returning();

    const optionsByQuestion = new Map<string, Option[]>();
    for (const option of insertedOptions) {
      const list = optionsByQuestion.get(option.questionId) ?? [];
      list.push(option);
      optionsByQuestion.set(option.questionId, list);
    }

    return insertedQuestions.map((question) => ({
      ...question,
      options: optionsByQuestion.get(question.id) ?? [],
    }));
  },

  async update(
    questionId: string,
    input: { question?: string; marks?: number; order?: number }
  ): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(input)
      .where(eq(questions.id, questionId))
      .returning();

    if (!question) throw new NotFoundError("Question", questionId);
    return question;
  },

  /**
   * Swap a question's entire option set.
   *
   * Deleting and re-inserting (rather than diffing) keeps the operation simple
   * and correct. Existing answers point at the old option ids, which is why
   * `answers.selectedOptionId` is `on delete set null` rather than cascade —
   * the attempt survives, with the stale choice cleared.
   */
  async replaceOptions(
    questionId: string,
    drafts: readonly OptionDraftInput[]
  ): Promise<Option[]> {
    await db.delete(options).where(eq(options.questionId, questionId));

    return db
      .insert(options)
      .values(
        drafts.map((option, index) => ({
          questionId,
          text: option.text,
          isCorrect: option.isCorrect,
          order: index,
        }))
      )
      .returning();
  },

  /**
   * Apply a new question sequence.
   *
   * `order` is unique per exam, so writing the final values directly would
   * collide mid-update. Rows are first parked at negative offsets — outside the
   * range any real order occupies — then written to their targets, with the
   * whole sequence batched into one transaction.
   */
  async reorder(examId: string, questionIds: readonly string[]): Promise<void> {
    if (questionIds.length === 0) return;

    const park = questionIds.map((id, index) =>
      db
        .update(questions)
        .set({ order: -(index + 1) })
        .where(and(eq(questions.id, id), eq(questions.examId, examId)))
    );

    const apply = questionIds.map((id, index) =>
      db
        .update(questions)
        .set({ order: index })
        .where(and(eq(questions.id, id), eq(questions.examId, examId)))
    );

    const statements = [...park, ...apply];
    await db.batch([statements[0], ...statements.slice(1)]);
  },

  async delete(questionId: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, questionId));
  },

  async deleteMany(questionIds: readonly string[]): Promise<void> {
    if (questionIds.length === 0) return;
    await db.delete(questions).where(inArray(questions.id, questionIds));
  },
};
