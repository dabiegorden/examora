import { relations } from "drizzle-orm";

import { activeSessions } from "./active-sessions";
import { answers } from "./answers";
import { attempts } from "./attempts";
import { auditLogs } from "./audit-logs";
import { courseStudents } from "./course-students";
import { courses } from "./courses";
import { exams } from "./exams";
import { options } from "./options";
import { questions } from "./questions";
import { students } from "./students";
import { users } from "./users";

/**
 * Drizzle relations, kept in one file so the whole graph is readable at a
 * glance. These power `db.query.*` relational reads; the foreign keys
 * themselves are declared on the tables.
 */

export const usersRelations = relations(users, ({ one, many }) => ({
  /** Present only when `role` is `student`. */
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  /** Present only when `role` is `teacher`. */
  taughtCourses: many(courses),
  sessions: many(activeSessions),
  auditLogs: many(auditLogs),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  enrolments: many(courseStudents),
  attempts: many(attempts),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  enrolments: many(courseStudents),
  exams: many(exams),
}));

export const courseStudentsRelations = relations(courseStudents, ({ one }) => ({
  course: one(courses, {
    fields: [courseStudents.courseId],
    references: [courses.id],
  }),
  student: one(students, {
    fields: [courseStudents.studentId],
    references: [students.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id],
  }),
  questions: many(questions),
  attempts: many(attempts),
  auditLogs: many(auditLogs),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
  options: many(options),
  answers: many(answers),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
  answers: many(answers),
}));

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  exam: one(exams, {
    fields: [attempts.examId],
    references: [exams.id],
  }),
  student: one(students, {
    fields: [attempts.studentId],
    references: [students.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  attempt: one(attempts, {
    fields: [answers.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(options, {
    fields: [answers.selectedOptionId],
    references: [options.id],
  }),
}));

export const activeSessionsRelations = relations(activeSessions, ({ one }) => ({
  user: one(users, {
    fields: [activeSessions.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [auditLogs.examId],
    references: [exams.id],
  }),
}));
