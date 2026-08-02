import type {
  activeSessions,
  answers,
  attempts,
  auditLogs,
  courseStudents,
  courses,
  exams,
  options,
  questions,
  students,
  users,
} from "@/db/schema";

/**
 * Row and insert types, inferred straight from the schema.
 *
 * Nothing here is hand-written — adding a column to a table updates these
 * automatically, so the types can never drift from the database.
 */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseStudent = typeof courseStudents.$inferSelect;
export type NewCourseStudent = typeof courseStudents.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

export type ActiveSession = typeof activeSessions.$inferSelect;
export type NewActiveSession = typeof activeSessions.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

/* -------------------------------------------------------------------------- */
/*                              Enum value unions                             */
/* -------------------------------------------------------------------------- */

export type UserRole = User["role"];
export type UserStatus = User["status"];
export type ExamStatus = Exam["status"];
export type AttemptStatus = Attempt["status"];
export type AuditAction = AuditLog["action"];

/* -------------------------------------------------------------------------- */
/*                           Common composite shapes                          */
/* -------------------------------------------------------------------------- */

/** A student row joined to the account it belongs to. */
export type StudentWithUser = Student & { user: User };

/** A course with its owning teacher. */
export type CourseWithTeacher = Course & { teacher: User };

/** A question with the options a student picks from. */
export type QuestionWithOptions = Question & { options: Option[] };

/** A full paper, ready to render in the exam engine or the editor. */
export type ExamWithQuestions = Exam & { questions: QuestionWithOptions[] };

/** An exam alongside the course it belongs to. */
export type ExamWithCourse = Exam & { course: Course };

/** An attempt with everything needed to grade or review it. */
export type AttemptWithAnswers = Attempt & { answers: Answer[] };

/** An attempt joined to the student who sat it — the live-monitoring row. */
export type AttemptWithStudent = Attempt & { student: StudentWithUser };
