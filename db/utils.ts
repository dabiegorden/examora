import { and, eq, sql } from "drizzle-orm";

import { normalizeEmail } from "@/utils/text";
import type { AuditAction, NewAuditLog } from "@/types/db";
import { db } from "./client";
import {
  attempts,
  auditLogs,
  courseStudents,
  courses,
  exams,
  students,
  users,
} from "./schema";

/**
 * Small, composable lookups used across repositories, services, and the seed.
 *
 * Convention: every `find*` returns `null` when nothing matches. Callers that
 * require a row use the `*OrThrow` variants in the repositories, which raise a
 * `NotFoundError`. Absence is a normal outcome here, not an exception.
 */

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user ?? null;
}

export async function findUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function findStudent(studentId: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  return student ?? null;
}

export async function findStudentByUserId(userId: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);

  return student ?? null;
}

export async function findCourse(courseId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  return course ?? null;
}

export async function findExam(examId: string) {
  const [exam] = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
  return exam ?? null;
}

export async function findAttempt(attemptId: string) {
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, attemptId))
    .limit(1);

  return attempt ?? null;
}

/** The single attempt a student has on an exam, if they have started it. */
export async function findAttemptForStudent(examId: string, studentId: string) {
  const [attempt] = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.examId, examId), eq(attempts.studentId, studentId)))
    .limit(1);

  return attempt ?? null;
}

/**
 * Whether a student is enrolled on a course.
 *
 * The gate for "may this student open this exam" — checked before an attempt is
 * created rather than trusting an exam id from the client.
 */
export async function isStudentEnrolled(
  courseId: string,
  studentId: string
): Promise<boolean> {
  const [row] = await db
    .select({ courseId: courseStudents.courseId })
    .from(courseStudents)
    .where(
      and(
        eq(courseStudents.courseId, courseId),
        eq(courseStudents.studentId, studentId)
      )
    )
    .limit(1);

  return row !== undefined;
}

/** Whether a teacher owns the course an exam belongs to. */
export async function teacherOwnsExam(
  examId: string,
  teacherId: string
): Promise<boolean> {
  const [row] = await db
    .select({ examId: exams.id })
    .from(exams)
    .innerJoin(courses, eq(exams.courseId, courses.id))
    .where(and(eq(exams.id, examId), eq(courses.teacherId, teacherId)))
    .limit(1);

  return row !== undefined;
}

/**
 * Append an audit entry.
 *
 * Deliberately never throws: an integrity log that can take down a student's
 * exam submission is worse than a missing log line. Failures are reported to
 * the server console for the operator instead.
 */
export async function createAuditLog(entry: {
  action: AuditAction;
  userId?: string | null;
  examId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const row: NewAuditLog = {
    action: entry.action,
    userId: entry.userId ?? null,
    examId: entry.examId ?? null,
    metadata: entry.metadata,
  };

  try {
    await db.insert(auditLogs).values(row);
  } catch (error) {
    console.error("[examora] failed to write audit log", { action: entry.action, error });
  }
}

/** `COUNT(*)` for a prepared where-clause, returned as a number. */
export async function countRows(
  query: Promise<Array<{ count: number }>>
): Promise<number> {
  const [row] = await query;
  return row?.count ?? 0;
}

/** `count(*)::int` — Postgres returns bigint, which the driver would give as a string. */
export const countExpression = sql<number>`cast(count(*) as int)`;
