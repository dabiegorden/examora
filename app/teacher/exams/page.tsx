import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardListIcon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DashboardSection,
  DataToolbar,
  EmptyState,
  ExamStatusBadge,
  PageHeader,
  StatCard,
  type FilterConfig,
} from "@/components/dashboard";
import {
  exams,
  formatDaysAgo,
  type ExamRow,
} from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Exams",
  robots: { index: false, follow: false },
};

const filters: readonly FilterConfig[] = [
  {
    id: "course",
    label: "Filter by course",
    placeholder: "Course",
    options: [
      { value: "all", label: "All courses" },
      { value: "phy101", label: "PHY101" },
      { value: "mth101", label: "MTH101" },
      { value: "chm101", label: "CHM101" },
      { value: "bio101", label: "BIO101" },
    ],
  },
  {
    id: "status",
    label: "Filter by status",
    placeholder: "Status",
    options: [
      { value: "all", label: "All statuses" },
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "completed", label: "Completed" },
    ],
  },
];

/** Exams read better as cards than rows — each carries several distinct facts. */
function ExamCard({ exam }: { exam: ExamRow }) {
  const submissionRate =
    exam.candidates > 0 ? Math.round((exam.submissions / exam.candidates) * 100) : 0;

  return (
    <Link
      href="/teacher/exams"
      className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/8 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand transition-colors group-hover:bg-brand group-hover:text-white dark:text-brand-accent">
          <ClipboardListIcon className="size-4" aria-hidden="true" />
        </span>
        <ExamStatusBadge status={exam.status} />
      </div>

      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-foreground">{exam.title}</p>
        <p className="text-xs text-muted-foreground">
          {exam.course} · updated {formatDaysAgo(exam.updatedDaysAgo).toLowerCase()}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
        <div>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <FileTextIcon className="size-3" aria-hidden="true" />
            Questions
          </dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {exam.questions}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <ClockIcon className="size-3" aria-hidden="true" />
            Duration
          </dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {exam.durationMinutes}m
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted-foreground">
            <UsersIcon className="size-3" aria-hidden="true" />
            Sat
          </dt>
          <dd className="mt-0.5 font-medium tabular-nums text-foreground">
            {exam.submissions}/{exam.candidates}
          </dd>
        </div>
      </dl>

      {exam.status === "completed" ? (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${submissionRate}%` }}
            />
          </div>
          <p className="text-[0.7rem] text-muted-foreground">
            {submissionRate}% submitted
          </p>
        </div>
      ) : null}
    </Link>
  );
}

export default function ExamsPage() {
  const published = exams.filter((exam) => exam.status === "published").length;
  const drafts = exams.filter((exam) => exam.status === "draft").length;
  const completed = exams.filter((exam) => exam.status === "completed").length;

  return (
    <>
      <PageHeader
        title="Exams"
        description="Every paper you have built, from first draft to graded results."
        actions={
          <Link
            href="/teacher/exams"
            className={cn(buttonVariants(), "h-9 bg-brand hover:bg-brand-hover")}
          >
            <PlusIcon aria-hidden="true" />
            Create exam
          </Link>
        }
      />

      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total exams" value={String(exams.length)} hint="All statuses" />
          <StatCard label="Published" value={String(published)} hint="Visible to students" />
          <StatCard label="Drafts" value={String(drafts)} hint="Not yet visible" />
          <StatCard label="Completed" value={String(completed)} hint="Graded and closed" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <Card>
          <CardContent>
            <DataToolbar
              searchLabel="Search exams"
              searchPlaceholder="Search by title…"
              filters={filters}
            />
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection delay={0.15}>
        {exams.length === 0 ? (
          <Card>
            <EmptyState
              icon={ClipboardListIcon}
              title="No exams yet"
              description="Build your first paper from the question bank, then publish it to your class."
              action={
                <Link
                  href="/teacher/exams"
                  className={cn(buttonVariants(), "bg-brand hover:bg-brand-hover")}
                >
                  <PlusIcon aria-hidden="true" />
                  Create exam
                </Link>
              }
            />
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam) => (
              <li key={exam.id}>
                <ExamCard exam={exam} />
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </>
  );
}
