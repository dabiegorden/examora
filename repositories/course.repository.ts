import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db/client";
import { courseStudents, courses, exams, users } from "@/db/schema";
import { countExpression, findCourse } from "@/db/utils";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import { normalizeCourseCode } from "@/utils/text";
import type { Paginated, PaginationParams } from "@/types/common";
import type { Course, CourseWithTeacher } from "@/types/db";
import type { CreateCourseInput, UpdateCourseInput } from "@/validators/course";

interface ListCoursesParams extends PaginationParams {
  search?: string;
  includeArchived?: boolean;
}

/** A course row with the counts a listing card shows. */
export interface CourseWithCounts extends Course {
  studentCount: number;
  examCount: number;
}

export const CourseRepository = {
  findById: findCourse,

  async findByIdOrThrow(courseId: string): Promise<Course> {
    const course = await findCourse(courseId);
    if (!course) throw new NotFoundError("Course", courseId);
    return course;
  },

  async findWithTeacher(courseId: string): Promise<CourseWithTeacher | null> {
    const [row] = await db
      .select({ course: courses, teacher: users })
      .from(courses)
      .innerJoin(users, eq(courses.teacherId, users.id))
      .where(eq(courses.id, courseId))
      .limit(1);

    return row ? { ...row.course, teacher: row.teacher } : null;
  },

  /**
   * Ownership check used before any teacher-initiated mutation.
   *
   * Returning the row (rather than a boolean) lets callers do one round trip
   * instead of checking ownership and then fetching the same course.
   */
  async findOwnedOrThrow(courseId: string, teacherId: string): Promise<Course> {
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)))
      .limit(1);

    if (!course) throw new NotFoundError("Course", courseId);
    return course;
  },

  async create(teacherId: string, input: CreateCourseInput): Promise<Course> {
    const code = normalizeCourseCode(input.code);

    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.teacherId, teacherId), eq(courses.code, code)))
      .limit(1);

    if (existing) {
      throw new ConflictError(`You already have a course with the code ${code}.`);
    }

    const [course] = await db
      .insert(courses)
      .values({
        teacherId,
        title: input.title,
        code,
        description: input.description,
        academicYear: input.academicYear,
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

    const [course] = await db
      .update(courses)
      .set({
        ...input,
        ...(input.code ? { code: normalizeCourseCode(input.code) } : {}),
      })
      .where(eq(courses.id, courseId))
      .returning();

    return course;
  },

  async setArchived(
    courseId: string,
    teacherId: string,
    isArchived: boolean
  ): Promise<Course> {
    return this.update(courseId, teacherId, { isArchived });
  },

  /** A teacher's courses, with student and exam counts for the dashboard. */
  async listByTeacher(
    teacherId: string,
    params: ListCoursesParams = {}
  ): Promise<Paginated<CourseWithCounts>> {
    const pagination = normalizePagination(params);
    const search = params.search?.trim();

    const where = and(
      eq(courses.teacherId, teacherId),
      params.includeArchived ? undefined : eq(courses.isArchived, false),
      search
        ? or(ilike(courses.title, `%${search}%`), ilike(courses.code, `%${search}%`))
        : undefined
    );

    const [rows, [totals]] = await Promise.all([
      db
        .select({
          course: courses,
          studentCount: db.$count(
            courseStudents,
            eq(courseStudents.courseId, courses.id)
          ),
          examCount: db.$count(exams, eq(exams.courseId, courses.id)),
        })
        .from(courses)
        .where(where)
        .orderBy(desc(courses.createdAt))
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

  /** Courses a student is enrolled on. */
  async listByStudent(studentId: string): Promise<Course[]> {
    const rows = await db
      .select({ course: courses })
      .from(courseStudents)
      .innerJoin(courses, eq(courseStudents.courseId, courses.id))
      .where(
        and(eq(courseStudents.studentId, studentId), eq(courses.isArchived, false))
      )
      .orderBy(desc(courses.createdAt));

    return rows.map((row) => row.course);
  },

  async delete(courseId: string, teacherId: string): Promise<void> {
    await this.findOwnedOrThrow(courseId, teacherId);
    await db.delete(courses).where(eq(courses.id, courseId));
  },
};
