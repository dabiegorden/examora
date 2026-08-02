import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClipboardListIcon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ActivityTimeline,
  DashboardCard,
  DashboardSection,
  DashboardTable,
  ExamStatusBadge,
  PageHeader,
  QuickActionCard,
  SectionTitle,
  StatCard,
  StudentStatusBadge,
  type Column,
} from "@/components/dashboard";
import { requireTeacher } from "@/lib/auth/dal";
import {
  formatCountdown,
  formatDaysAgo,
  overviewStats,
  quickActions,
  recentActivity,
  students,
  upcomingExams,
  type StudentRow,
  type UpcomingExam,
} from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const statIcons = [BookOpenIcon, UsersIcon, ClipboardListIcon, TrendingUpIcon];

const examColumns: ReadonlyArray<Column<UpcomingExam>> = [
  {
    id: "title",
    header: "Exam",
    cell: (exam) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{exam.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {exam.course} · {exam.questions} questions · {exam.durationMinutes} min
        </p>
      </div>
    ),
    className: "min-w-[14rem]",
  },
  {
    id: "status",
    header: "Status",
    cell: (exam) => <ExamStatusBadge status={exam.status} />,
  },
  {
    id: "candidates",
    header: "Candidates",
    cell: (exam) => <span className="tabular-nums">{exam.candidates}</span>,
    hideBelow: "lg",
    align: "end",
  },
  {
    id: "starts",
    header: "Starts",
    cell: (exam) => (
      <span className="text-muted-foreground tabular-nums">
        {formatCountdown(exam.hoursUntil)}
      </span>
    ),
    hideBelow: "sm",
    align: "end",
  },
];

const studentColumns: ReadonlyArray<Column<StudentRow>> = [
  {
    id: "student",
    header: "Student",
    cell: (student) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback className="bg-brand-subtle text-[0.65rem] font-semibold text-brand dark:text-brand-accent">
            {student.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{student.name}</p>
          <p className="truncate text-xs text-muted-foreground">{student.email}</p>
        </div>
      </div>
    ),
    className: "min-w-[13rem]",
  },
  {
    id: "courses",
    header: "Courses",
    cell: (student) => <span className="tabular-nums">{student.courseCount}</span>,
    hideBelow: "md",
    align: "end",
  },
  {
    id: "status",
    header: "Status",
    cell: (student) => <StudentStatusBadge status={student.status} />,
    align: "end",
  },
];

export default async function TeacherDashboardPage() {
  const user = await requireTeacher();
  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your courses today."
        actions={
          <>
            <Link
              href="/teacher/exams"
              className={cn(buttonVariants({ variant: "outline" }), "h-9")}
            >
              View exams
            </Link>
            <Link
              href="/teacher/courses"
              className={cn(buttonVariants(), "h-9 bg-brand hover:bg-brand-hover")}
            >
              <PlusIcon aria-hidden="true" />
              New course
            </Link>
          </>
        }
      />

      {/* Stats */}
      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              hint={stat.hint}
              icon={statIcons[index]}
            />
          ))}
        </div>
      </DashboardSection>

      {/* Quick actions */}
      <DashboardSection delay={0.1}>
        <SectionTitle
          title="Quick actions"
          description="The things teachers do most, one click away."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} action={action} />
          ))}
        </div>
      </DashboardSection>

      {/* Upcoming exams + activity */}
      <DashboardSection delay={0.15}>
        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardCard
            title="Upcoming exams"
            description="Scheduled sittings across your courses."
            className="xl:col-span-2"
            flush
            action={
              <Link
                href="/teacher/exams"
                className={cn(buttonVariants({ variant: "ghost" }), "h-8 text-xs")}
              >
                View all
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            }
          >
            <DashboardTable
              columns={examColumns}
              rows={upcomingExams}
              rowKey={(exam) => exam.id}
              caption="Exams scheduled to open soon"
            />
          </DashboardCard>

          <DashboardCard
            title="Recent activity"
            description="The last few things that happened."
          >
            <ActivityTimeline entries={recentActivity} />
          </DashboardCard>
        </div>
      </DashboardSection>

      {/* Latest students */}
      <DashboardSection delay={0.2}>
        <DashboardCard
          title="Latest students"
          description="Recently enrolled across all courses."
          flush
          action={
            <Link
              href="/teacher/students"
              className={cn(buttonVariants({ variant: "ghost" }), "h-8 text-xs")}
            >
              View all
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          }
        >
          <DashboardTable
            columns={[
              ...studentColumns.slice(0, 1),
              {
                id: "joined",
                header: "Joined",
                cell: (student: StudentRow) => (
                  <span className="text-muted-foreground">
                    {formatDaysAgo(student.joinedDaysAgo)}
                  </span>
                ),
                hideBelow: "lg" as const,
              },
              ...studentColumns.slice(1),
            ]}
            rows={students.slice(0, 6)}
            rowKey={(student) => student.id}
            caption="Most recently enrolled students"
          />
        </DashboardCard>
      </DashboardSection>

      <DashboardSection delay={0.25}>
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This dashboard is showing example data. Creating and editing arrives in
            the next phase.
          </p>
          <Button variant="ghost" size="sm" className="mt-2" disabled>
            Connect live data
          </Button>
        </div>
      </DashboardSection>
    </>
  );
}
