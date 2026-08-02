"use server";

import { revalidatePath } from "next/cache";

import { AUDIT_ACTION } from "@/constants/audit";
import { requireTeacher } from "@/lib/auth/dal";
import { toUserMessage } from "@/lib/errors";
import {
  AuditLogRepository,
  CourseRepository,
  type CourseWithCounts,
} from "@/repositories";
import { flattenZodError } from "@/utils/validation";
import {
  createCourseSchema,
  listCoursesSchema,
  updateCourseSchema,
  uuidCourseIdSchema,
} from "@/validators/course";
import type { ActionResult, Paginated } from "@/types/common";
import { err, ok } from "@/types/common";
import type { AuditAction } from "@/types/db";
import type { z } from "zod";

/**
 * Course server actions.
 *
 * Every action here is a trust boundary, not a convenience wrapper: a server
 * action is reachable by a direct POST, so none of them assume the caller came
 * from our UI. Each one re-establishes who is asking (`requireTeacher`),
 * re-validates the payload with Zod, and lets the repository re-check ownership
 * against the database before it writes anything.
 *
 * They return `ActionResult` rather than throwing, so the form can render a
 * field error or a toast instead of tripping the route's error boundary.
 */

/** Both surfaces that show course data. Kept together so none is forgotten. */
const COURSE_PATHS = ["/teacher/courses", "/teacher"] as const;

function revalidateCourses(): void {
  for (const path of COURSE_PATHS) revalidatePath(path);
}

function fieldErrorResult(error: z.ZodError): ActionResult<never> {
  return err({
    message: "Please correct the highlighted fields.",
    code: "VALIDATION",
    fieldErrors: flattenZodError(error),
  });
}

/**
 * Record a course event.
 *
 * `courseId` travels in `metadata`: the audit table's only foreign key is
 * `examId`, and adding a nullable column per entity would make the log's shape
 * grow with the domain. Never throws — see `createAuditLog`.
 */
async function recordCourseEvent(
  action: AuditAction,
  teacherId: string,
  course: { id: string; title: string; code: string }
): Promise<void> {
  await AuditLogRepository.record({
    action,
    userId: teacherId,
    metadata: { courseId: course.id, title: course.title, code: course.code },
  });
}

export async function createCourse(
  input: unknown
): Promise<ActionResult<CourseWithCounts>> {
  const teacher = await requireTeacher();

  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) return fieldErrorResult(parsed.error);

  try {
    const course = await CourseRepository.create(teacher.id, parsed.data);
    await recordCourseEvent(AUDIT_ACTION.COURSE_CREATED, teacher.id, course);
    revalidateCourses();

    // A new course has no students and no exams yet, so the counts are known
    // without another query.
    return ok({ ...course, studentCount: 0, examCount: 0 });
  } catch (error) {
    return err({ message: toUserMessage(error), code: "CONFLICT" });
  }
}

export async function updateCourse(
  courseId: unknown,
  input: unknown
): Promise<ActionResult<CourseWithCounts>> {
  const teacher = await requireTeacher();

  const id = uuidCourseIdSchema.safeParse(courseId);
  if (!id.success) return err({ message: "That course could not be found." });

  const parsed = updateCourseSchema.safeParse(input);
  if (!parsed.success) return fieldErrorResult(parsed.error);

  try {
    await CourseRepository.update(id.data, teacher.id, parsed.data);
    const course = await CourseRepository.findOwnedWithCounts(id.data, teacher.id);

    await recordCourseEvent(AUDIT_ACTION.COURSE_UPDATED, teacher.id, course);
    revalidateCourses();

    return ok(course);
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}

/** Archive and restore share a body; only the flag and the audit line differ. */
async function setCourseArchived(
  courseId: unknown,
  isArchived: boolean
): Promise<ActionResult<CourseWithCounts>> {
  const teacher = await requireTeacher();

  const id = uuidCourseIdSchema.safeParse(courseId);
  if (!id.success) return err({ message: "That course could not be found." });

  try {
    await CourseRepository.setArchived(id.data, teacher.id, isArchived);
    const course = await CourseRepository.findOwnedWithCounts(id.data, teacher.id);

    await recordCourseEvent(
      isArchived ? AUDIT_ACTION.COURSE_ARCHIVED : AUDIT_ACTION.COURSE_RESTORED,
      teacher.id,
      course
    );
    revalidateCourses();

    return ok(course);
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}

export async function archiveCourse(
  courseId: unknown
): Promise<ActionResult<CourseWithCounts>> {
  return setCourseArchived(courseId, true);
}

export async function restoreCourse(
  courseId: unknown
): Promise<ActionResult<CourseWithCounts>> {
  return setCourseArchived(courseId, false);
}

/**
 * Delete a course.
 *
 * Soft only. Exams, attempts, and results reference the course, so removing the
 * row would take a term of assessment history with it.
 */
export async function deleteCourse(
  courseId: unknown
): Promise<ActionResult<{ id: string }>> {
  const teacher = await requireTeacher();

  const id = uuidCourseIdSchema.safeParse(courseId);
  if (!id.success) return err({ message: "That course could not be found." });

  try {
    // Read before the write: the audit entry needs the title and code, which
    // are the only human-readable trace left once the row is hidden.
    const existing = await CourseRepository.findOwnedOrThrow(id.data, teacher.id);
    await CourseRepository.softDelete(id.data, teacher.id);

    await recordCourseEvent(AUDIT_ACTION.COURSE_DELETED, teacher.id, existing);
    revalidateCourses();

    return ok({ id: existing.id });
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}

/**
 * Read the teacher's courses.
 *
 * The page loads this directly through the repository; this action exists for
 * the client's retry path, where a failed table needs to re-fetch without a
 * full navigation.
 */
export async function listCourses(
  params: unknown
): Promise<ActionResult<Paginated<CourseWithCounts>>> {
  const teacher = await requireTeacher();

  const parsed = listCoursesSchema.safeParse(params ?? {});
  if (!parsed.success) return fieldErrorResult(parsed.error);

  try {
    return ok(await CourseRepository.listByTeacher(teacher.id, parsed.data));
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}
