import type { LucideIcon } from "lucide-react";
import {
  AlarmClockIcon,
  BarChart3Icon,
  BookOpenIcon,
  BuildingIcon,
  CheckCheckIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  FileUpIcon,
  GaugeIcon,
  GraduationCapIcon,
  HistoryIcon,
  LayoutGridIcon,
  LibraryIcon,
  MaximizeIcon,
  MonitorCheckIcon,
  SaveIcon,
  ScanEyeIcon,
  SendIcon,
  ShieldCheckIcon,
  ShuffleIcon,
  SparklesIcon,
  TimerIcon,
  UserCogIcon,
  UserRoundPlusIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                    Site                                    */
/* -------------------------------------------------------------------------- */

export const siteConfig = {
  name: "Examora",
  tagline: "Secure online exams made simple.",
  description:
    "Examora is a secure online MCQ examination platform for teachers. Build your question bank, import students in bulk, and run proctored exams that grade themselves the moment the timer stops.",
  url: "https://examora.app",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: readonly NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
] as const;

/* -------------------------------------------------------------------------- */
/*                                  Audiences                                 */
/* -------------------------------------------------------------------------- */

export interface Audience {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const audiences: readonly Audience[] = [
  {
    icon: GraduationCapIcon,
    title: "Teachers",
    description:
      "Replace stacks of answer sheets with exams that mark themselves and release results the same minute.",
  },
  {
    icon: BookOpenIcon,
    title: "Tutors",
    description:
      "Run weekly assessments for private students and track who is improving, question by question.",
  },
  {
    icon: UsersIcon,
    title: "Coaching Centres",
    description:
      "Assess hundreds of candidates across parallel batches without printing a single paper.",
  },
  {
    icon: BuildingIcon,
    title: "Schools",
    description:
      "Give every department one secure place to author, schedule, and moderate examinations.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                  Features                                  */
/* -------------------------------------------------------------------------- */

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: readonly Feature[] = [
  {
    icon: ClipboardListIcon,
    title: "Create Exams",
    description:
      "Compose an MCQ paper in minutes with per-question marks, negative marking, and instant preview.",
  },
  {
    icon: LibraryIcon,
    title: "Question Bank",
    description:
      "Keep a reusable, tagged library of questions and pull them into any exam you build later.",
  },
  {
    icon: FileUpIcon,
    title: "Bulk Student Import",
    description:
      "Onboard an entire class at once — Examora creates accounts and sends credentials for you.",
  },
  {
    icon: FileSpreadsheetIcon,
    title: "Excel Import",
    description:
      "Upload an .xlsx roster or question sheet and map columns with a guided importer.",
  },
  {
    icon: DatabaseIcon,
    title: "CSV Import",
    description:
      "Bring data across from any student information system using plain CSV files.",
  },
  {
    icon: CheckCheckIcon,
    title: "Automatic Grading",
    description:
      "Every submission is scored against your answer key the instant it lands. No manual marking.",
  },
  {
    icon: TimerIcon,
    title: "Question Timer",
    description:
      "Cap the time spent on individual questions to keep the pace even across the cohort.",
  },
  {
    icon: AlarmClockIcon,
    title: "Exam Timer",
    description:
      "A synchronised countdown that survives refreshes and submits automatically at zero.",
  },
  {
    icon: MaximizeIcon,
    title: "Fullscreen Protection",
    description:
      "Lock the exam into fullscreen and log every attempt to leave it while the clock runs.",
  },
  {
    icon: MonitorCheckIcon,
    title: "Single Device Login",
    description:
      "One active session per student, so shared credentials can never mean two people writing.",
  },
  {
    icon: SaveIcon,
    title: "Auto Save",
    description:
      "Answers persist as they are selected. A dropped connection never costs a student their work.",
  },
  {
    icon: ZapIcon,
    title: "Instant Results",
    description:
      "Publish scores the moment an exam closes, or hold them back for review — your call.",
  },
  {
    icon: BarChart3Icon,
    title: "Analytics",
    description:
      "See score distribution, per-question difficulty, and the topics your class keeps missing.",
  },
  {
    icon: LayoutGridIcon,
    title: "Course Management",
    description:
      "Group exams, students, and materials under courses that mirror how you already teach.",
  },
  {
    icon: UserRoundPlusIcon,
    title: "Student Management",
    description:
      "Enrol, suspend, or reset a student in a click, with their full attempt history attached.",
  },
  {
    icon: ShuffleIcon,
    title: "Question Randomisation",
    description:
      "Shuffle questions and options per student so no two papers look the same.",
  },
  {
    icon: UserCogIcon,
    title: "Role Management",
    description:
      "Invite co-teachers and assistants with scoped permissions over courses and results.",
  },
  {
    icon: GaugeIcon,
    title: "Live Monitoring",
    description:
      "Watch progress in real time — who has started, who is mid-paper, who has submitted.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                How it works                                */
/* -------------------------------------------------------------------------- */

export interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const steps: readonly Step[] = [
  {
    icon: LayoutGridIcon,
    title: "Create a course",
    description:
      "Set up the subject, term, and grading rules once. Everything you build afterwards lives inside it.",
  },
  {
    icon: FileUpIcon,
    title: "Upload your students",
    description:
      "Import a CSV or Excel roster. Examora provisions accounts and delivers credentials automatically.",
  },
  {
    icon: ClipboardListIcon,
    title: "Create the exam",
    description:
      "Pull questions from your bank, set the timer, and choose which security controls apply.",
  },
  {
    icon: SendIcon,
    title: "Students take the exam",
    description:
      "They sit the paper in a locked session. Grading, ranking, and analytics are ready on submission.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                  Security                                  */
/* -------------------------------------------------------------------------- */

export interface SecurityControl {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const securityControls: readonly SecurityControl[] = [
  {
    icon: MonitorCheckIcon,
    title: "One Active Session",
    description:
      "A student can only be signed in on a single device. New sign-ins end the previous session.",
  },
  {
    icon: SaveIcon,
    title: "Auto Save",
    description:
      "Answers are written continuously, so a crash or dropped network never loses an attempt.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Sessions",
    description:
      "Short-lived, signed session tokens scoped to one exam sitting and revoked on submission.",
  },
  {
    icon: ShuffleIcon,
    title: "Question Randomisation",
    description:
      "Independent question and option ordering per student makes copying an answer key useless.",
  },
  {
    icon: ScanEyeIcon,
    title: "Tab Monitoring",
    description:
      "Every tab switch or window blur is timestamped and attached to the student's attempt.",
  },
  {
    icon: MaximizeIcon,
    title: "Fullscreen Mode",
    description:
      "The paper opens locked to fullscreen, with configurable warnings on each exit attempt.",
  },
  {
    icon: AlarmClockIcon,
    title: "Automatic Submission",
    description:
      "When the timer reaches zero the attempt is submitted as-is. No late edits, no disputes.",
  },
  {
    icon: HistoryIcon,
    title: "Audit Logs",
    description:
      "An immutable trail of every action — sign-ins, answer changes, violations, and submissions.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                 Comparison                                 */
/* -------------------------------------------------------------------------- */

export interface ComparisonRow {
  criterion: string;
  examora: string;
  paper: string;
}

export const comparisonRows: readonly ComparisonRow[] = [
  {
    criterion: "Marking 120 scripts",
    examora: "Graded automatically on submission",
    paper: "Several evenings of manual marking",
  },
  {
    criterion: "Results turnaround",
    examora: "Instant, with rank and breakdown",
    paper: "Days, once every script is totalled",
  },
  {
    criterion: "Cheating controls",
    examora: "Randomisation, fullscreen lock, tab logs",
    paper: "Seating plans and invigilator attention",
  },
  {
    criterion: "Cost per exam",
    examora: "No printing, no logistics",
    paper: "Printing, transport, and storage every time",
  },
  {
    criterion: "Reusing questions",
    examora: "A searchable, tagged question bank",
    paper: "Retyping from last year's paper",
  },
  {
    criterion: "Insight into weak topics",
    examora: "Per-question analytics for the whole cohort",
    paper: "A gut feeling from the totals",
  },
  {
    criterion: "Lost or damaged scripts",
    examora: "Every answer saved continuously",
    paper: "Irrecoverable if misplaced",
  },
  {
    criterion: "Remote or split cohorts",
    examora: "Anyone, anywhere, same secure sitting",
    paper: "Everyone in one hall at one time",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    quote:
      "I used to lose two weekends to marking every term. My last mock had results published before the students had left the lab.",
    name: "Adwoa Mensimah",
    role: "Physics Teacher, Accra",
    initials: "AM",
  },
  {
    quote:
      "The question bank changed how I plan. I build a paper from tagged questions in about ten minutes, and no two students see the same order.",
    name: "Daniel Okonkwo",
    role: "Director, Brightpath Coaching",
    initials: "DO",
  },
  {
    quote:
      "Single device login and the tab logs settled every argument we used to have about integrity. The audit trail speaks for itself.",
    name: "Priya Raghunathan",
    role: "Head of Assessment, Northfield School",
    initials: "PR",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                     FAQ                                    */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: readonly FaqItem[] = [
  {
    question: "Do my students need to install anything?",
    answer:
      "No. Examora runs entirely in the browser on laptops, tablets, and phones. Students sign in with the credentials you issue and start writing — there is nothing to download or configure.",
  },
  {
    question: "What happens if a student loses internet mid-exam?",
    answer:
      "Answers are saved continuously as they are selected, and the timer is anchored to the server rather than the device. When the student reconnects they resume exactly where they stopped, with the correct time remaining.",
  },
  {
    question: "How does Examora stop students from cheating?",
    answer:
      "Several controls work together: question and option randomisation, fullscreen lock, tab-switch monitoring, one active session per student, and a full audit log of every action. You choose which controls apply to each exam.",
  },
  {
    question: "Can I import my existing students and questions?",
    answer:
      "Yes. Upload a CSV or Excel file and map your columns with the guided importer. Examora creates the student accounts, issues credentials, and adds questions straight into your bank.",
  },
  {
    question: "Which question types are supported?",
    answer:
      "Examora is built specifically for multiple choice assessment — single answer, multiple answer, and true or false — with per-question marks and optional negative marking. That focus is what makes grading instant and reliable.",
  },
  {
    question: "Can other teachers help me manage a course?",
    answer:
      "Invite co-teachers and assistants with scoped roles. You decide who can author questions, publish exams, and view or release results, and every change is attributed in the audit log.",
  },
  {
    question: "When do students see their results?",
    answer:
      "That is entirely up to you. Release scores the instant an exam closes, hold them for manual review, or publish results and detailed answer breakdowns separately.",
  },
  {
    question: "Is my exam data private and secure?",
    answer:
      "Exams, question banks, and student records are encrypted in transit and at rest, isolated per account, and only ever visible to the roles you grant. Nothing is used to train models or shared with third parties.",
  },
  {
    question: "How many students can sit an exam at once?",
    answer:
      "Examora is built for whole-cohort sittings and scales to thousands of concurrent candidates. Live monitoring shows you who has started, who is mid-paper, and who has submitted.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

export interface FooterColumn {
  title: string;
  links: readonly NavLink[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "Security", href: "#security" },
      { label: "Why Examora", href: "#why-examora" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Getting Started", href: "/docs/getting-started" },
      { label: "Question Bank Guide", href: "/docs/question-bank" },
      { label: "Importing Students", href: "/docs/imports" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Data Processing", href: "/legal/dpa" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
] as const;

/** Highlights used as social proof under the hero. */
export interface HeroStat {
  icon: LucideIcon;
  label: string;
}

export const heroStats: readonly HeroStat[] = [
  { icon: CheckCheckIcon, label: "Automatic grading" },
  { icon: ShieldCheckIcon, label: "Proctored sessions" },
  { icon: SparklesIcon, label: "Results in seconds" },
] as const;
