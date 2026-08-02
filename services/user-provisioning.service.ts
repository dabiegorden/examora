// See the note in `auth.service.ts` on why this layer is not `server-only`.
import { StudentRepository, UserRepository } from "@/repositories";
import { LIMITS } from "@/constants/app";
import { USER_ROLE } from "@/constants/roles";
import { ConflictError, ForbiddenError, ValidationError } from "@/lib/errors";
import { generateTemporaryPassword } from "@/lib/auth/tokens";
import { normalizeEmail, normalizeStudentNumber } from "@/utils/text";
import type { Student, User } from "@/types/db";
import type { ImportStudentRow } from "@/validators/student";

/**
 * Account provisioning.
 *
 * Examora has no public sign-up for students — a student account exists only
 * because a teacher created it. That rule is enforced here rather than in the UI:
 * every student-creating function demands the acting teacher and checks the role.
 */

export interface ProvisionedStudent {
  student: Student;
  user: User;
  /**
   * The generated password, returned **once** so the teacher can hand it over.
   * It is never stored in plain text and never written to the audit log.
   */
  temporaryPassword: string;
}

export interface ProvisionedTeacher {
  user: User;
  /** The password now in force — echoed once when it was generated here. */
  password: string;
  isGenerated: boolean;
}

export interface BulkResult {
  created: ProvisionedStudent[];
  /** Rows rejected individually, so one bad line does not sink the whole file. */
  failed: Array<{ row: ImportStudentRow; reason: string }>;
}

function assertTeacher(actor: User): void {
  if (actor.role !== USER_ROLE.TEACHER) {
    throw new ForbiddenError("Only teachers can create student accounts.");
  }
}

export const UserProvisioningService = {
  /**
   * Create a teacher.
   *
   * No acting user is required because this is the bootstrap path — a CLI or
   * seed script. It is deliberately not exposed through a server action; there
   * is no self-service teacher sign-up.
   */
  async createTeacher(input: {
    fullName: string;
    email: string;
    /** Omit to have a temporary one generated, which forces a change at first sign-in. */
    password?: string;
    mustChangePassword?: boolean;
  }): Promise<ProvisionedTeacher> {
    const password = input.password ?? generateTemporaryPassword();
    const isGenerated = input.password === undefined;

    const user = await UserRepository.create({
      fullName: input.fullName,
      email: input.email,
      password,
      role: USER_ROLE.TEACHER,
      // A password nobody chose must not become permanent.
      mustChangePassword: input.mustChangePassword ?? isGenerated,
    });

    return { user, password, isGenerated };
  },

  /**
   * Create one student on behalf of a teacher.
   *
   * When no password is supplied a temporary one is generated and
   * `mustChangePassword` is raised, so the student must replace it at first
   * sign-in before they can reach anything.
   */
  async createStudent(
    actor: User,
    input: {
      fullName: string;
      email: string;
      studentNumber: string;
      password?: string;
      courseIds?: readonly string[];
    }
  ): Promise<ProvisionedStudent> {
    assertTeacher(actor);

    const temporaryPassword = input.password ?? generateTemporaryPassword();
    const isGenerated = input.password === undefined;

    const created = await StudentRepository.create({
      fullName: input.fullName,
      email: input.email,
      password: temporaryPassword,
      studentNumber: input.studentNumber,
    });

    if (isGenerated) {
      await UserRepository.setMustChangePassword(created.user.id, true);
    }

    if (input.courseIds?.length) {
      for (const courseId of input.courseIds) {
        await StudentRepository.enrol(courseId, [created.id]);
      }
    }

    const { user, ...student } = created;

    return {
      student,
      user: { ...user, mustChangePassword: isGenerated },
      temporaryPassword,
    };
  },

  /**
   * Create many students from an imported roster.
   *
   * Rows are processed one at a time and failures collected rather than thrown.
   * A teacher uploading 200 students should not lose the other 199 because one
   * email was already taken — they get a per-row report instead.
   *
   * Duplicates *within* the file are caught up front, since those would
   * otherwise surface as confusing conflicts against rows this same import just
   * created.
   */
  async bulkCreateStudents(
    actor: User,
    rows: readonly ImportStudentRow[],
    options: { courseId?: string } = {}
  ): Promise<BulkResult> {
    assertTeacher(actor);

    if (rows.length > LIMITS.BULK_IMPORT_MAX_ROWS) {
      throw new ValidationError(
        `Imports are limited to ${LIMITS.BULK_IMPORT_MAX_ROWS} students at a time.`
      );
    }

    const result: BulkResult = { created: [], failed: [] };

    const seenEmails = new Set<string>();
    const seenNumbers = new Set<string>();

    for (const row of rows) {
      const email = normalizeEmail(row.email);
      const studentNumber = normalizeStudentNumber(row.studentNumber);

      if (seenEmails.has(email)) {
        result.failed.push({ row, reason: `Duplicate email in file: ${email}` });
        continue;
      }
      if (seenNumbers.has(studentNumber)) {
        result.failed.push({
          row,
          reason: `Duplicate student number in file: ${studentNumber}`,
        });
        continue;
      }

      seenEmails.add(email);
      seenNumbers.add(studentNumber);

      try {
        const provisioned = await this.createStudent(actor, {
          fullName: row.fullName,
          email: row.email,
          studentNumber: row.studentNumber,
          courseIds: options.courseId ? [options.courseId] : undefined,
        });

        result.created.push(provisioned);
      } catch (error) {
        result.failed.push({
          row,
          reason:
            error instanceof ConflictError
              ? error.message
              : "Could not create this student.",
        });
      }
    }

    return result;
  },

  /**
   * Issue a fresh temporary password for a student who has lost theirs.
   *
   * The teacher-driven equivalent of a reset link, for students without reliable
   * email. Returns the password once and forces a change at next sign-in.
   */
  async resetStudentPassword(actor: User, studentId: string): Promise<string> {
    assertTeacher(actor);

    const student = await StudentRepository.findByIdOrThrow(studentId);
    const temporaryPassword = generateTemporaryPassword();

    await UserRepository.updatePassword(student.userId, temporaryPassword);
    await UserRepository.setMustChangePassword(student.userId, true);

    return temporaryPassword;
  },
};
