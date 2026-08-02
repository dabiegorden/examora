import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  ClipboardListIcon,
  FileSpreadsheetIcon,
  LibraryIcon,
  LogInIcon,
  SendIcon,
  UserRoundPlusIcon,
} from "lucide-react";

/**
 * Placeholder content for the dashboard shell.
 *
 * This phase is UI only — nothing here is read from or written to the database.
 * It lives in one module so that swapping in real repository calls later means
 * deleting this file, not hunting through pages for inline fixtures.
 *
 * Dates are expressed as offsets from render time rather than fixed timestamps,
 * so the "upcoming" exams never drift into the past.
 */

export type ExamStatusValue = "draft" | "published" | "completed";
export type StudentStatusValue = "active" | "inactive" | "suspended";
export type DifficultyValue = "easy" | "medium" | "hard";

/* -------------------------------------------------------------------------- */
/*                                    Stats                                   */
/* -------------------------------------------------------------------------- */

export interface StatSummary {
  label: string;
  value: string;
  /** Percentage change against the previous period. */
  change: number;
  hint: string;
}

export const overviewStats: readonly StatSummary[] = [
  { label: "Total courses", value: "6", change: 12.5, hint: "2 added this term" },
  { label: "Total students", value: "184", change: 8.2, hint: "15 enrolled this week" },
  { label: "Total exams", value: "23", change: -4.1, hint: "3 awaiting publication" },
  { label: "Average score", value: "74.2%", change: 3.6, hint: "Across 18 graded exams" },
];

/* -------------------------------------------------------------------------- */
/*                                Quick actions                               */
/* -------------------------------------------------------------------------- */

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Renders disabled with a "Coming soon" badge. */
  comingSoon?: boolean;
}

export const quickActions: readonly QuickAction[] = [
  {
    title: "Create course",
    description: "Set up a subject, term, and grading rules.",
    href: "/teacher/courses",
    icon: BookOpenIcon,
  },
  {
    title: "Add student",
    description: "Create an account and issue credentials.",
    href: "/teacher/students",
    icon: UserRoundPlusIcon,
  },
  {
    title: "Create exam",
    description: "Build a paper from your question bank.",
    href: "/teacher/exams",
    icon: ClipboardListIcon,
  },
  {
    title: "Question bank",
    description: "Browse and tag reusable questions.",
    href: "/teacher/question-bank",
    icon: LibraryIcon,
  },
  {
    title: "Import students",
    description: "Upload a CSV or Excel roster.",
    href: "/teacher/students",
    icon: FileSpreadsheetIcon,
    comingSoon: true,
  },
  {
    title: "Import questions",
    description: "Bring a question sheet into the bank.",
    href: "/teacher/question-bank",
    icon: SendIcon,
    comingSoon: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                               Recent activity                              */
/* -------------------------------------------------------------------------- */

export interface ActivityEntry {
  id: string;
  title: string;
  description: string;
  /** Minutes before render time. Formatted relative at display. */
  minutesAgo: number;
  icon: LucideIcon;
  tone: "brand" | "success" | "muted";
}

export const recentActivity: readonly ActivityEntry[] = [
  {
    id: "a1",
    title: "Student added",
    description: "Ama Boateng was enrolled on Physics (PHY101).",
    minutesAgo: 8,
    icon: UserRoundPlusIcon,
    tone: "brand",
  },
  {
    id: "a2",
    title: "Exam created",
    description: "Mathematics — Mid-Term Assessment saved as a draft.",
    minutesAgo: 52,
    icon: ClipboardListIcon,
    tone: "muted",
  },
  {
    id: "a3",
    title: "Course published",
    description: "Physics (PHY101) is now visible to 15 students.",
    minutesAgo: 180,
    icon: BookOpenIcon,
    tone: "success",
  },
  {
    id: "a4",
    title: "Exam submitted",
    description: "Kwesi Owusu submitted Physics — Mid-Term (21/30).",
    minutesAgo: 320,
    icon: SendIcon,
    tone: "success",
  },
  {
    id: "a5",
    title: "Student signed in",
    description: "Lena Fischer signed in from a new device.",
    minutesAgo: 460,
    icon: LogInIcon,
    tone: "muted",
  },
];

/* -------------------------------------------------------------------------- */
/*                               Upcoming exams                               */
/* -------------------------------------------------------------------------- */

export interface UpcomingExam {
  id: string;
  title: string;
  course: string;
  status: ExamStatusValue;
  /** Hours from render time until the sitting opens. */
  hoursUntil: number;
  durationMinutes: number;
  questions: number;
  candidates: number;
}

export const upcomingExams: readonly UpcomingExam[] = [
  {
    id: "e1",
    title: "Physics — Mid-Term Assessment",
    course: "PHY101",
    status: "published",
    hoursUntil: 19,
    durationMinutes: 45,
    questions: 20,
    candidates: 15,
  },
  {
    id: "e2",
    title: "Mathematics — Mid-Term Assessment",
    course: "MTH101",
    status: "draft",
    hoursUntil: 76,
    durationMinutes: 45,
    questions: 20,
    candidates: 10,
  },
  {
    id: "e3",
    title: "Physics — Waves Quiz",
    course: "PHY101",
    status: "published",
    hoursUntil: 122,
    durationMinutes: 20,
    questions: 12,
    candidates: 15,
  },
  {
    id: "e4",
    title: "Mathematics — Algebra Retake",
    course: "MTH101",
    status: "draft",
    hoursUntil: 240,
    durationMinutes: 30,
    questions: 15,
    candidates: 4,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Students                                  */
/* -------------------------------------------------------------------------- */

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  initials: string;
  courseCount: number;
  status: StudentStatusValue;
  joinedDaysAgo: number;
}

export const students: readonly StudentRow[] = [
  { id: "s1", name: "Ama Boateng", email: "ama.boateng@examora.app", studentNumber: "EXM-2026-001", initials: "AB", courseCount: 2, status: "active", joinedDaysAgo: 1 },
  { id: "s2", name: "Kwesi Owusu", email: "kwesi.owusu@examora.app", studentNumber: "EXM-2026-002", initials: "KO", courseCount: 2, status: "active", joinedDaysAgo: 1 },
  { id: "s3", name: "Lena Fischer", email: "lena.fischer@examora.app", studentNumber: "EXM-2026-003", initials: "LF", courseCount: 2, status: "active", joinedDaysAgo: 2 },
  { id: "s4", name: "Ravi Sharma", email: "ravi.sharma@examora.app", studentNumber: "EXM-2026-004", initials: "RS", courseCount: 2, status: "active", joinedDaysAgo: 3 },
  { id: "s5", name: "Chiamaka Eze", email: "chiamaka.eze@examora.app", studentNumber: "EXM-2026-005", initials: "CE", courseCount: 1, status: "inactive", joinedDaysAgo: 5 },
  { id: "s6", name: "Tomas Silva", email: "tomas.silva@examora.app", studentNumber: "EXM-2026-006", initials: "TS", courseCount: 1, status: "active", joinedDaysAgo: 6 },
  { id: "s7", name: "Aisha Bello", email: "aisha.bello@examora.app", studentNumber: "EXM-2026-007", initials: "AB", courseCount: 2, status: "active", joinedDaysAgo: 8 },
  { id: "s8", name: "Daniel Mensah", email: "daniel.mensah@examora.app", studentNumber: "EXM-2026-008", initials: "DM", courseCount: 1, status: "suspended", joinedDaysAgo: 11 },
  { id: "s9", name: "Sofia Rossi", email: "sofia.rossi@examora.app", studentNumber: "EXM-2026-009", initials: "SR", courseCount: 2, status: "active", joinedDaysAgo: 12 },
  { id: "s10", name: "Yusuf Karim", email: "yusuf.karim@examora.app", studentNumber: "EXM-2026-010", initials: "YK", courseCount: 1, status: "active", joinedDaysAgo: 14 },
  { id: "s11", name: "Grace Otieno", email: "grace.otieno@examora.app", studentNumber: "EXM-2026-011", initials: "GO", courseCount: 2, status: "active", joinedDaysAgo: 15 },
  { id: "s12", name: "Mateo Alvarez", email: "mateo.alvarez@examora.app", studentNumber: "EXM-2026-012", initials: "MA", courseCount: 1, status: "inactive", joinedDaysAgo: 18 },
];

/* -------------------------------------------------------------------------- */
/*                                   Courses                                  */
/* -------------------------------------------------------------------------- */

export interface CourseRow {
  id: string;
  title: string;
  code: string;
  academicYear: string;
  studentCount: number;
  examCount: number;
  isArchived: boolean;
  updatedDaysAgo: number;
}

export const courses: readonly CourseRow[] = [
  { id: "c1", title: "Physics", code: "PHY101", academicYear: "2025/2026", studentCount: 15, examCount: 3, isArchived: false, updatedDaysAgo: 1 },
  { id: "c2", title: "Mathematics", code: "MTH101", academicYear: "2025/2026", studentCount: 10, examCount: 2, isArchived: false, updatedDaysAgo: 2 },
  { id: "c3", title: "Chemistry", code: "CHM101", academicYear: "2025/2026", studentCount: 22, examCount: 4, isArchived: false, updatedDaysAgo: 4 },
  { id: "c4", title: "Biology", code: "BIO101", academicYear: "2025/2026", studentCount: 18, examCount: 3, isArchived: false, updatedDaysAgo: 7 },
  { id: "c5", title: "Further Mathematics", code: "MTH201", academicYear: "2025/2026", studentCount: 9, examCount: 2, isArchived: false, updatedDaysAgo: 12 },
  { id: "c6", title: "Physics (Legacy)", code: "PHY100", academicYear: "2024/2025", studentCount: 24, examCount: 9, isArchived: true, updatedDaysAgo: 210 },
];

/* -------------------------------------------------------------------------- */
/*                                    Exams                                   */
/* -------------------------------------------------------------------------- */

export interface ExamRow {
  id: string;
  title: string;
  course: string;
  status: ExamStatusValue;
  questions: number;
  totalMarks: number;
  durationMinutes: number;
  submissions: number;
  candidates: number;
  updatedDaysAgo: number;
}

export const exams: readonly ExamRow[] = [
  { id: "x1", title: "Physics — Mid-Term Assessment", course: "PHY101", status: "published", questions: 20, totalMarks: 30, durationMinutes: 45, submissions: 0, candidates: 15, updatedDaysAgo: 1 },
  { id: "x2", title: "Mathematics — Mid-Term Assessment", course: "MTH101", status: "draft", questions: 20, totalMarks: 31, durationMinutes: 45, submissions: 0, candidates: 10, updatedDaysAgo: 2 },
  { id: "x3", title: "Chemistry — Periodic Table Quiz", course: "CHM101", status: "completed", questions: 15, totalMarks: 20, durationMinutes: 25, submissions: 22, candidates: 22, updatedDaysAgo: 9 },
  { id: "x4", title: "Biology — Cell Structure", course: "BIO101", status: "completed", questions: 18, totalMarks: 25, durationMinutes: 30, submissions: 17, candidates: 18, updatedDaysAgo: 14 },
  { id: "x5", title: "Physics — Waves Quiz", course: "PHY101", status: "published", questions: 12, totalMarks: 15, durationMinutes: 20, submissions: 0, candidates: 15, updatedDaysAgo: 3 },
  { id: "x6", title: "Further Mathematics — Sequences", course: "MTH201", status: "draft", questions: 10, totalMarks: 20, durationMinutes: 25, submissions: 0, candidates: 9, updatedDaysAgo: 21 },
];

/* -------------------------------------------------------------------------- */
/*                                Question bank                               */
/* -------------------------------------------------------------------------- */

export interface QuestionRow {
  id: string;
  question: string;
  course: string;
  topic: string;
  difficulty: DifficultyValue;
  marks: number;
  options: number;
  usedInExams: number;
}

export const questionBank: readonly QuestionRow[] = [
  { id: "q1", question: "What is the SI unit of force?", course: "PHY101", topic: "Mechanics", difficulty: "easy", marks: 1, options: 4, usedInExams: 3 },
  { id: "q2", question: "A body moves at constant velocity. What is the net force acting on it?", course: "PHY101", topic: "Mechanics", difficulty: "medium", marks: 1, options: 4, usedInExams: 2 },
  { id: "q3", question: "What is the kinetic energy of a 4 kg object moving at 5 m/s?", course: "PHY101", topic: "Energy", difficulty: "medium", marks: 2, options: 4, usedInExams: 4 },
  { id: "q4", question: "Light travelling from air into glass will:", course: "PHY101", topic: "Optics", difficulty: "hard", marks: 2, options: 4, usedInExams: 1 },
  { id: "q5", question: "Solve for x: 3x + 7 = 22", course: "MTH101", topic: "Algebra", difficulty: "easy", marks: 1, options: 4, usedInExams: 5 },
  { id: "q6", question: "Factorise: x² − 9", course: "MTH101", topic: "Algebra", difficulty: "medium", marks: 2, options: 4, usedInExams: 3 },
  { id: "q7", question: "Two lines are perpendicular. If one has gradient 2, the other has gradient:", course: "MTH101", topic: "Geometry", difficulty: "hard", marks: 2, options: 4, usedInExams: 2 },
  { id: "q8", question: "What is the value of log₁₀(1000)?", course: "MTH101", topic: "Logarithms", difficulty: "medium", marks: 2, options: 4, usedInExams: 1 },
  { id: "q9", question: "Which of the following is a scalar quantity?", course: "PHY101", topic: "Mechanics", difficulty: "easy", marks: 1, options: 4, usedInExams: 6 },
  { id: "q10", question: "In a series circuit, the current through each component is:", course: "PHY101", topic: "Electricity", difficulty: "medium", marks: 2, options: 4, usedInExams: 2 },
];

/* -------------------------------------------------------------------------- */
/*                                   Results                                  */
/* -------------------------------------------------------------------------- */

export interface LeaderboardRow {
  rank: number;
  name: string;
  initials: string;
  course: string;
  score: number;
  total: number;
  percentage: number;
}

export const leaderboard: readonly LeaderboardRow[] = [
  { rank: 1, name: "Sofia Rossi", initials: "SR", course: "CHM101", score: 20, total: 20, percentage: 100 },
  { rank: 2, name: "Ravi Sharma", initials: "RS", course: "CHM101", score: 19, total: 20, percentage: 95 },
  { rank: 3, name: "Ama Boateng", initials: "AB", course: "BIO101", score: 23, total: 25, percentage: 92 },
  { rank: 4, name: "Grace Otieno", initials: "GO", course: "CHM101", score: 18, total: 20, percentage: 90 },
  { rank: 5, name: "Aisha Bello", initials: "AB", course: "BIO101", score: 21, total: 25, percentage: 84 },
  { rank: 6, name: "Kwesi Owusu", initials: "KO", course: "BIO101", score: 20, total: 25, percentage: 80 },
];

/** Score distribution buckets — rendered as bars, not a charting library. */
export interface DistributionBucket {
  band: string;
  count: number;
}

export const scoreDistribution: readonly DistributionBucket[] = [
  { band: "0–39%", count: 4 },
  { band: "40–49%", count: 9 },
  { band: "50–59%", count: 17 },
  { band: "60–69%", count: 28 },
  { band: "70–79%", count: 34 },
  { band: "80–89%", count: 21 },
  { band: "90–100%", count: 11 },
];

export interface TopicPerformance {
  topic: string;
  course: string;
  correctRate: number;
  attempts: number;
}

export const topicPerformance: readonly TopicPerformance[] = [
  { topic: "Mechanics", course: "PHY101", correctRate: 82, attempts: 240 },
  { topic: "Energy", course: "PHY101", correctRate: 71, attempts: 180 },
  { topic: "Optics", course: "PHY101", correctRate: 54, attempts: 150 },
  { topic: "Algebra", course: "MTH101", correctRate: 88, attempts: 200 },
  { topic: "Geometry", course: "MTH101", correctRate: 63, attempts: 160 },
  { topic: "Logarithms", course: "MTH101", correctRate: 47, attempts: 120 },
];

/* -------------------------------------------------------------------------- */
/*                                Notifications                               */
/* -------------------------------------------------------------------------- */

export interface NotificationEntry {
  id: string;
  title: string;
  description: string;
  minutesAgo: number;
  unread: boolean;
}

export const notifications: readonly NotificationEntry[] = [
  {
    id: "n1",
    title: "Physics mid-term opens tomorrow",
    description: "15 candidates are scheduled for 09:00.",
    minutesAgo: 45,
    unread: true,
  },
  {
    id: "n2",
    title: "3 exams still in draft",
    description: "They will not be visible to students until published.",
    minutesAgo: 300,
    unread: true,
  },
  {
    id: "n3",
    title: "Chemistry quiz graded",
    description: "22 of 22 submissions scored automatically.",
    minutesAgo: 1440,
    unread: false,
  },
];

/* -------------------------------------------------------------------------- */
/*                             Formatting helpers                             */
/* -------------------------------------------------------------------------- */

/** "8m ago", "3h ago", "2d ago" — compact enough for a timeline. */
export function formatRelativeMinutes(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)}m ago`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

export function formatDaysAgo(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

/** Countdown placeholder: "in 19h", "in 3d". */
export function formatCountdown(hours: number): string {
  if (hours < 1) return "starting now";
  if (hours < 24) return `in ${Math.round(hours)}h`;

  const days = Math.floor(hours / 24);
  const remainder = Math.round(hours % 24);
  return remainder > 0 ? `in ${days}d ${remainder}h` : `in ${days}d`;
}
