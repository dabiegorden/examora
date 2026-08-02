import { and, asc, desc, eq, ilike, isNull, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db/client";
import { courseStudents, courses, exams, users } from "@/db/schema";
import { countExpression } from "@/db/utils";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import { normalizeCourseCode } from "@/utils/text";
import type { Paginated, PaginationParams, SortDirection } from "@/types/common";
import type { Course, CourseWithTeacher } from "@/types/db";
import type {
  CourseSortField,
  CourseStatusFilter,
  CreateCourseInput,
  UpdateCourseInput,
} from "@/validators/course";

interface ListCoursesParams extends PaginationParams {
  search?: string;
  status?: CourseStatusFilter;
  academicYear?: string;
  sortBy?: CourseSortField;
  sortDirection?: SortDirection;
}

/** A course row with the counts a listing card shows. */
export interface CourseWithCounts extends Course {
  studentCount: number;
  examCount: number;
}

/** How many active/archived courses a teacher has — drives the filter counts. */
export interface CourseStatusCounts {
  active: number;
  archived: number;
  total: number;
}

/**
 * Correlated counts.
 *
 * Subqueries rather than joins with `GROUP BY`: joining both child tables to
 * the same course would multiply their rows against each other and inflate both
 * counts. They are also plain expressions, so one definition serves the SELECT
 * list and `ORDER BY` alike.
 *
 * Built with `db.$count` rather than a hand-written `sql` template, because a
 * template only interpolates a *column* as a bare name when the outer query has
 * no joins. `exams` has an `id` of its own, so `where course_id = id` would bind
 * to the exam rather than to the course and count nothing. `$count` emits the
 * table-qualified form, which cannot capture the wrong `id`.
 */
const studentCountExpression = db.$count(
  courseStudents,
  eq(courseStudents.courseId, courses.id)
);

const examCountExpression = db.$count(exams, eq(exams.courseId, courses.id));

/** Every read filters on this — a soft-deleted course does not exist. */
const notDeleted = isNull(courses.deletedAt);

function statusCondition(status: CourseStatusFilter = "active"): SQL | undefined {
  if (status === "active") return eq(courses.isArchived, false);
  if (status === "archived") return eq(courses.isArchived, true);
  return undefined;
}

function orderExpression(
  sortBy: CourseSortField = "createdAt",
  direction: SortDirection = "desc"
) {
  const order = direction === "asc" ? asc : desc;

  switch (sortBy) {
    case "title":
      return order(courses.title);
    case "studentCount":
      return order(studentCountExpression);
    case "examCount":
      return order(examCountExpression);
    default:
      return order(courses.createdAt);
  }
}

export const CourseRepository = {
  async findById(courseId: string): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), notDeleted))
      .limit(1);

    return course ?? null;
  },

  async findByIdOrThrow(courseId: string): Promise<Course> {
    const course = await this.findById(courseId);
    if (!course) throw new NotFoundError("Course", courseId);
    return course;
  },

  async findWithTeacher(courseId: string): Promise<CourseWithTeacher | null> {
    const [row] = await db
      .select({ course: courses, teacher: users })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(and(eq(courses.id, courseId), notDeleted))
      .limit(1);

    return row ? { ...row.course, teacher: row.teacher } : null;
  },

  /**
   * Ownership check used before any teacher-initiated mutation.
   *
   * Returning the row (rather than a boolean) lets callers do one round trip
   * instead of checking ownership and then fetching the same course.
   *
   * A course owned by *another* teacher raises `NotFoundError` rather than a
   * forbidden error: confirming that an id exists but belongs to someone else
   * is itself a disclosure.
   */
  async findOwnedOrThrow(courseId: string, teacherId: string): Promise<Course> {
    const [course] = await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.id, courseId), eq(courses.teacherId, teacherId), notDeleted)
      )
      .limit(1);

    if (!course) throw new NotFoundError("Course", courseId);
    return course;
  },

  /** The same row, with the counts the list and detail views show. */
  async findOwnedWithCounts(
    courseId: string,
    teacherId: string
  ): Promise<CourseWithCounts> {
    const course = await this.findOwnedOrThrow(courseId, teacherId);

    const [row] = await db
      .select({
        studentCount: studentCountExpression,
        examCount: examCountExpression,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    return {
      ...course,
      studentCount: Number(row?.studentCount ?? 0),
      examCount: Number(row?.examCount ?? 0),
    };
  },

  /**
   * Whether this teacher already uses a course code.
   *
   * `excludeCourseId` is passed when editing, so a course cannot collide with
   * itself. Scoped to live rows, matching the partial unique index.
   */
  async isCodeTaken(
    teacherId: string,
    code: string,
    excludeCourseId?: string
  ): Promise<boolean> {
    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(
        and(
          eq(courses.teacherId, teacherId),
          eq(courses.code, normalizeCourseCode(code)),
          excludeCourseId ? ne(courses.id, excludeCourseId) : undefined,
          notDeleted
        )
      )
      .limit(1);

    return existing !== undefined;
  },

  async create(teacherId: string, input: CreateCourseInput): Promise<Course> {
    const code = normalizeCourseCode(input.code);

    if (await this.isCodeTaken(teacherId, code)) {
      throw new ConflictError(`You already have a course with the code ${code}.`);
    }

    const [course] = await db
      .insert(courses)
      .values({
        teacherId,
        title: input.title,
        code,
        description: input.description ?? null,
        academicYear: input.academicYear ?? null,
      })
      .returning();

    return course;
  },

  async update(
    courseId: string,
    teacherId: string,
    input: UpdateCourseInput
  ): Promise<Course> {
    await this.findOwnedOrThrow(courseId, teacherId);

    const code = input.code ? normalizeCourseCode(input.code) : undefined;

    if (code && (await this.isCodeTaken(teacherId, code, courseId))) {
      throw new ConflictError(`You already have a course with the code ${code}.`);
    }

    const [course] = await db
      .update(courses)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(code ? { code } : {}),
        // `description` and `academicYear` are nullable and clearable, so the
        // key must be present to be written. A partial update that omits them
        // leaves them alone; one that sends an empty value clears them.
        ...("description" in input ? { description: input.description ?? null } : {}),
        ...("academicYear" in input
          ? { academicYear: input.academicYear ?? null }
          : {}),
        ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
      })
      .where(and(eq(courses.id, courseId), notDeleted))
      .returning();

    return course;
  },

  async setArchived(
    courseId: string,
    teacherId: string,
    isArchived: boolean
  ): Promise<Course> {
    await this.findOwnedOrThrow(courseId, teacherId);

    const [course] = await db
      .update(courses)
      .set({ isArchived })
      .where(and(eq(courses.id, courseId), notDeleted))
      .returning();

    return course;
  },

  /**
   * Soft delete.
   *
   * The row stays: exams, attempts, and results reference it, and a hard delete
   * would cascade a term of assessment history away. It is archived at the same
   * time so anything still reading `isArchived` — a student view, a report —
   * also stops surfacing it.
   */
  async softDelete(courseId: string, teacherId: string): Promise<Course> {
    await this.findOwnedOrThrow(courseId, teacherId);

    const [course] = await db
      .update(courses)
      .set({ deletedAt: new Date(), isArchived: true })
      .where(and(eq(courses.id, courseId), notDeleted))
      .returning();

    return course;
  },

  /** A teacher's courses, filtered, sorted, and paged for the list page. */
  async listByTeacher(
    teacherId: string,
    params: ListCoursesParams = {}
  ): Promise<Paginated<CourseWithCounts>> {
    const pagination = normalizePagination(params);
    const search = params.search?.trim();

    const where = and(
      eq(courses.teacherId, teacherId),
      notDeleted,
      statusCondition(params.status),
      params.academicYear ? eq(courses.academicYear, params.academicYear) : undefined,
      search
        ? or(ilike(courses.title, `%${search}%`), ilike(courses.code, `%${search}%`))
        : undefined
    );

    const [rows, [totals]] = await Promise.all([
      db
        .select({
          course: courses,
          studentCount: studentCountExpression,
          examCount: examCountExpression,
        })
        .from(courses)
        .where(where)
        // `courses.id` breaks ties so paging is stable: without it, two courses
        // sharing a sort value can swap places between pages and one of them
        // never appears.
        .orderBy(orderExpression(params.sortBy, params.sortDirection), desc(courses.id))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db.select({ count: countExpression }).from(courses).where(where),
    ]);

    return buildPaginated(
      rows.map((row) => ({
        ...row.course,
        studentCount: Number(row.studentCount),
        examCount: Number(row.examCount),
      })),
      totals?.count ?? 0,
      pagination
    );
  },

  /** Active/archived totals, for the header stats and the status facet. */
  async countByStatus(teacherId: string): Promise<CourseStatusCounts> {
    const [row] = await db
      .select({
        active: sql<number>`cast(count(*) filter (where ${courses.isArchived} = false) as int)`,
        archived: sql<number>`cast(count(*) filter (where ${courses.isArchived} = true) as int)`,
        total: countExpression,
      })
      .from(courses)
      .where(and(eq(courses.teacherId, teacherId), notDeleted));

    return {
      active: Number(row?.active ?? 0),
      archived: Number(row?.archived ?? 0),
      total: Number(row?.total ?? 0),
    };
  },

  /**
   * The academic years this teacher has actually used.
   *
   * The filter offers only years that exist, so it can never present an option
   * that returns nothing.
   */
  async listAcademicYears(teacherId: string): Promise<string[]> {
    const rows = await db
      .selectDistinct({ academicYear: courses.academicYear })
      .from(courses)
      .where(and(eq(courses.teacherId, teacherId), notDeleted))
      .orderBy(desc(courses.academicYear));

    return rows
      .map((row) => row.academicYear)
      .filter((year): year is string => Boolean(year));
  },

  /** Enrolled students and exams across a teacher's live, active courses. */
  async totalsForTeacher(
    teacherId: string
  ): Promise<{ students: number; exams: number }> {
    const [row] = await db
      .select({
        students: sql<number>`cast(coalesce(sum(${studentCountExpression}), 0) as int)`,
        exams: sql<number>`cast(coalesce(sum(${examCountExpression}), 0) as int)`,
      })
      .from(courses)
      .where(
        and(eq(courses.teacherId, teacherId), eq(courses.isArchived, false), notDeleted)
      );

    return { students: Number(row?.students ?? 0), exams: Number(row?.exams ?? 0) };
  },

  /** Courses a student is enrolled on. */
  async listByStudent(studentId: string): Promise<Course[]> {
    const rows = await db
      .select({ course: courses })
      .from(courseStudents)
      .innerJoin(courses, eq(courseStudents.courseId, courses.id))
      .where(
        and(
          eq(courseStudents.studentId, studentId),
          eq(courses.isArchived, false),
          notDeleted
        )
      )
      .orderBy(desc(courses.createdAt));

    return rows.map((row) => row.course);
  },
};
