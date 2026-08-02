/**
 * Repository barrel.
 *
 * Repositories own every query in the application. Server components, services,
 * and actions call these; nothing above this layer imports `db` directly, which
 * keeps schema changes contained to `db/` and this folder.
 */

export { AttemptRepository } from "./attempt.repository";
export { AuditLogRepository } from "./audit-log.repository";
export {
  CourseRepository,
  type CourseStatusCounts,
  type CourseWithCounts,
} from "./course.repository";
export { ExamRepository, type ExamWithStats } from "./exam.repository";
export { PasswordResetRepository } from "./password-reset.repository";
export { QuestionRepository } from "./question.repository";
export { SessionRepository } from "./session.repository";
export { StudentRepository } from "./student.repository";
export { UserRepository } from "./user.repository";
