import type { Metadata } from "next";
import Link from "next/link";
import {
  FileSpreadsheetIcon,
  MailIcon,
  MoreHorizontalIcon,
  UserRoundPlusIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ComingSoonBadge,
  DashboardSection,
  DashboardTable,
  DataToolbar,
  EmptyState,
  PageHeader,
  PaginationBar,
  StatCard,
  StudentStatusBadge,
  type Column,
  type FilterConfig,
} from "@/components/dashboard";
import {
  formatDaysAgo,
  students,
  type StudentRow,
} from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Students",
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
    ],
  },
  {
    id: "status",
    label: "Filter by status",
    placeholder: "Status",
    options: [
      { value: "all", label: "All statuses" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

const columns: ReadonlyArray<Column<StudentRow>> = [
  {
    id: "select",
    // Bulk selection is a placeholder in this phase — the checkboxes are inert.
    header: <Checkbox aria-label="Select all students" disabled />,
    cell: (student) => (
      <Checkbox aria-label={`Select ${student.name}`} disabled />
    ),
    className: "w-10",
  },
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
    id: "number",
    header: "Student number",
    cell: (student) => (
      <span className="font-mono text-xs text-muted-foreground">
        {student.studentNumber}
      </span>
    ),
    hideBelow: "xl",
  },
  {
    id: "courses",
    header: "Courses",
    cell: (student) => <span className="tabular-nums">{student.courseCount}</span>,
    hideBelow: "md",
    align: "end",
  },
  {
    id: "joined",
    header: "Joined",
    cell: (student) => (
      <span className="text-muted-foreground">{formatDaysAgo(student.joinedDaysAgo)}</span>
    ),
    hideBelow: "lg",
    align: "end",
  },
  {
    id: "status",
    header: "Status",
    cell: (student) => <StudentStatusBadge status={student.status} />,
    hideBelow: "sm",
    align: "end",
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    cell: (student) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${student.name}`}
            />
          }
        >
          <MoreHorizontalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem disabled>View profile</DropdownMenuItem>
          <DropdownMenuItem disabled>Edit details</DropdownMenuItem>
          <DropdownMenuItem disabled>Reset password</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled>
            Suspend student
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    className: "w-12",
    align: "end",
  },
];

export default function StudentsPage() {
  const active = students.filter((student) => student.status === "active").length;
  const suspended = students.filter((student) => student.status === "suspended").length;

  return (
    <>
      <PageHeader
        title="Students"
        description="Everyone you have enrolled. Students cannot sign up themselves — you create their accounts."
        actions={
          <>
            <Button variant="outline" className="h-9" disabled>
              <FileSpreadsheetIcon aria-hidden="true" />
              Import
              <ComingSoonBadge className="ml-1 hidden sm:inline-flex" />
            </Button>
            <Link
              href="/teacher/students"
              className={cn(buttonVariants(), "h-9 bg-brand hover:bg-brand-hover")}
            >
              <UserRoundPlusIcon aria-hidden="true" />
              Add student
            </Link>
          </>
        }
      />

      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total students" value={String(students.length)} hint="Across all courses" />
          <StatCard label="Active" value={String(active)} hint="Able to sit exams" />
          <StatCard label="Suspended" value={String(suspended)} hint="Sign-in blocked" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <Card>
          <CardContent className="space-y-3">
            <DataToolbar
              searchLabel="Search students"
              searchPlaceholder="Search by name, email, or number…"
              filters={filters}
              actions={
                <Button variant="outline" size="sm" disabled>
                  <MailIcon aria-hidden="true" />
                  Bulk actions
                </Button>
              }
            />

            <p className="text-xs text-muted-foreground">
              Selection and bulk actions are placeholders in this phase.
            </p>
          </CardContent>

          <DashboardTable
            columns={columns}
            rows={students}
            rowKey={(student) => student.id}
            caption="All enrolled students"
            empty={
              <EmptyState
                icon={UsersIcon}
                title="No students yet"
                description="Add students one at a time, or import a whole class from a CSV or Excel roster."
                action={
                  <Link
                    href="/teacher/students"
                    className={cn(buttonVariants(), "bg-brand hover:bg-brand-hover")}
                  >
                    <UserRoundPlusIcon aria-hidden="true" />
                    Add student
                  </Link>
                }
              />
            }
          />

          <PaginationBar
            from={1}
            to={students.length}
            total={students.length}
            label="students"
          />
        </Card>
      </DashboardSection>
    </>
  );
}
