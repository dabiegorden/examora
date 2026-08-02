import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";

import { db } from "@/db/client";
import { courseStudents, students, users } from "@/db/schema";
import { countExpression, findStudent, findStudentByUserId } from "@/db/utils";
import { USER_ROLE } from "@/constants/roles";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { buildPaginated, normalizePagination } from "@/utils/pagination";
import { normalizeStudentNumber } from "@/utils/text";
import type { Paginated, PaginationParams } from "@/types/common";
import type { Student, StudentWithUser, UserStatus } from "@/types/db";
import { UserRepository } from "./user.repository";

interface ListStudentsParams extends PaginationParams {
  courseId?: string;
  status?: UserStatus;
  search?: string;
}

export const StudentRepository = {
  findById: findStudent,
  findByUserId: findStudentByUserId,

  async findByIdOrThrow(studentId: string): Promise<Student> {
    const student = await findStudent(studentId);
    if (!student) throw new NotFoundError("Student", studentId);
    return student;
  },

  async findByStudentNumber(studentNumber: string): Promise<Student | null> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentNumber, normalizeStudentNumber(studentNumber)))
      .limit(1);

    return student ?? null;
  },

  /**
   * Create the account and its student profile.
   *
   * Two inserts, and the `neon-http` driver cannot wrap them in an interactive
   * transaction. If the profile insert fails we delete the account we just made,
   * so a duplicate student number never leaves a login with no profile behind.
   */
  async create(input: {
    fullName: string;
    email: string;
    password: string;
    studentNumber: string;
    status?: UserStatus;
  }): Promise<StudentWithUser> {
    const studentNumber = normalizeStudentNumber(input.studentNumber);

    if (await this.findByStudentNumber(studentNumber)) {
      throw new ConflictError(`Student number ${studentNumber} is already in use.`);
    }

    const user = await UserRepository.create({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
      role: USER_ROLE.STUDENT,
      status: input.status,
    });

    try {
      const [student] = await db
        .insert(students)
        .values({ userId: user.id, studentNumber })
        .returning();

      return { ...student, user };
    } catch (error) {
      await UserRepository.delete(user.id);
      throw error;
    }
  },

  async updateStudentNumber(studentId: string, studentNumber: string): Promise<Student> {
    const [student] = await db
      .update(students)
      .set({ studentNumber: normalizeStudentNumber(studentNumber) })
      .where(eq(students.id, studentId))
      .returning();

    if (!student) throw new NotFoundError("Student", studentId);
    return student;
  },

  /** Students on a course, newest enrolment first. */
  async listByCourse(courseId: string): Promise<StudentWithUser[]> {
    const rows = await db
      .select({ student: students, user: users })
      .from(courseStudents)
      .innerJoin(students, eq(courseStudents.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(courseStudents.courseId, courseId))
      .orderBy(desc(courseStudents.enrolledAt));

    return rows.map((row) => ({ ...row.student, user: row.user }));
  },

  async list(params: ListStudentsParams = {}): Promise<Paginated<StudentWithUser>> {
    const pagination = normalizePagination(params);
    const search = params.search?.trim();

    const where = and(
      eq(users.role, USER_ROLE.STUDENT),
      params.status ? eq(users.status, params.status) : undefined,
      search
        ? or(
            ilike(users.fullName, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(students.studentNumber, `%${search}%`)
          )
        : undefined
    );

    // Scoping to a course means going through the join table; without a course
    // filter that join would multiply rows per enrolment.
    const scopedIds = params.courseId
      ? db
          .select({ studentId: courseStudents.studentId })
          .from(courseStudents)
          .where(eq(courseStudents.courseId, params.courseId))
      : undefined;

    const finalWhere = scopedIds
      ? and(where, inArray(students.id, scopedIds))
      : where;

    const [rows, [totals]] = await Promise.all([
      db
        .select({ student: students, user: users })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(finalWhere)
        .orderBy(desc(students.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset),
      db
        .select({ count: countExpression })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(finalWhere),
    ]);

    return buildPaginated(
      rows.map((row) => ({ ...row.student, user: row.user })),
      totals?.count ?? 0,
      pagination
    );
  },

  /**
   * Enrol students on a course.
   *
   * `onConflictDoNothing` makes this idempotent, so re-running a bulk import
   * neither errors nor creates duplicates.
   */
  async enrol(courseId: string, studentIds: readonly string[]): Promise<number> {
    if (studentIds.length === 0) return 0;

    const inserted = await db
      .insert(courseStudents)
      .values(studentIds.map((studentId) => ({ courseId, studentId })))
      .onConflictDoNothing()
      .returning({ studentId: courseStudents.studentId });

    return inserted.length;
  },

  async unenrol(courseId: string, studentIds: readonly string[]): Promise<void> {
    if (studentIds.length === 0) return;

    await db
      .delete(courseStudents)
      .where(
        and(
          eq(courseStudents.courseId, courseId),
          inArray(courseStudents.studentId, studentIds)
        )
      );
  },

  /** Removes the student profile and, by cascade, the underlying account. */
  async delete(studentId: string): Promise<void> {
    const student = await this.findByIdOrThrow(studentId);
    await UserRepository.delete(student.userId);
  },
};
