import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArchivedBadge,
  DashboardSection,
  DashboardTable,
  DataToolbar,
  EmptyState,
  PageHeader,
  PaginationBar,
  StatCard,
  type Column,
  type FilterConfig,
} from "@/components/dashboard";
import { courses, formatDaysAgo, type CourseRow } from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false, follow: false },
};

const filters: readonly FilterConfig[] = [
  {
    id: "year",
    label: "Filter by academic year",
    placeholder: "Academic year",
    options: [
      { value: "all", label: "All years" },
      { value: "2025", label: "2025/2026" },
      { value: "2024", label: "2024/2025" },
    ],
  },
  {
    id: "status",
    label: "Filter by status",
    placeholder: "Status",
    options: [
      { value: "all", label: "All courses" },
      { value: "active", label: "Active" },
      { value: "archived", label: "Archived" },
    ],
  },
];

const columns: ReadonlyArray<Column<CourseRow>> = [
  {
    id: "course",
    header: "Course",
    cell: (course) => (
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent">
          <BookOpenIcon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-foreground">{course.title}</p>
            {course.isArchived ? <ArchivedBadge /> : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {course.code} · {course.academicYear}
          </p>
        </div>
      </div>
    ),
    className: "min-w-[14rem]",
  },
  {
    id: "students",
    header: "Students",
    cell: (course) => <span className="tabular-nums">{course.studentCount}</span>,
    hideBelow: "sm",
    align: "end",
  },
  {
    id: "exams",
    header: "Exams",
    cell: (course) => <span className="tabular-nums">{course.examCount}</span>,
    hideBelow: "md",
    align: "end",
  },
  {
    id: "updated",
    header: "Updated",
    cell: (course) => (
      <span className="text-muted-foreground">{formatDaysAgo(course.updatedDaysAgo)}</span>
    ),
    hideBelow: "lg",
    align: "end",
  },
  {
    id: "open",
    header: <span className="sr-only">Open</span>,
    cell: () => (
      <ArrowRightIcon
        aria-hidden="true"
        className="ml-auto size-4 text-muted-foreground"
      />
    ),
    className: "w-10",
    align: "end",
  },
];

export default function CoursesPage() {
  const active = courses.filter((course) => !course.isArchived);
  const totalStudents = active.reduce((sum, course) => sum + course.studentCount, 0);
  const totalExams = active.reduce((sum, course) => sum + course.examCount, 0);

  return (
    <>
      <PageHeader
        title="Courses"
        description="Every subject you assess. Courses hold your students, exams, and results."
        actions={
          <Link
            href="/teacher/courses"
            className={cn(buttonVariants(), "h-9 bg-brand hover:bg-brand-hover")}
          >
            <PlusIcon aria-hidden="true" />
            Create course
          </Link>
        }
      />

      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active courses" value={String(active.length)} hint="Visible to students" />
          <StatCard label="Enrolled students" value={String(totalStudents)} hint="Across active courses" />
          <StatCard label="Exams created" value={String(totalExams)} hint="Drafts and published" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <Card>
          <CardContent>
            <DataToolbar
              searchLabel="Search courses"
              searchPlaceholder="Search by title or code…"
              filters={filters}
            />
          </CardContent>

          <DashboardTable
            columns={columns}
            rows={courses}
            rowKey={(course) => course.id}
            caption="All courses"
            empty={
              <EmptyState
                icon={BookOpenIcon}
                title="No courses yet"
                description="Create your first course to start adding students and building exams."
                action={
                  <Link
                    href="/teacher/courses"
                    className={cn(buttonVariants(), "bg-brand hover:bg-brand-hover")}
                  >
                    <PlusIcon aria-hidden="true" />
                    Create course
                  </Link>
                }
              />
            }
          />

          <PaginationBar from={1} to={courses.length} total={courses.length} label="courses" />
        </Card>
      </DashboardSection>
    </>
  );
}
