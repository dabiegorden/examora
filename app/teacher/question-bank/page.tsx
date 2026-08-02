import type { Metadata } from "next";
import Link from "next/link";
import { LibraryIcon, PlusIcon, SendIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ComingSoonBadge,
  DashboardSection,
  DataToolbar,
  DifficultyBadge,
  EmptyState,
  PageHeader,
  PaginationBar,
  StatCard,
  type FilterConfig,
} from "@/components/dashboard";
import { questionBank } from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Question bank",
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
    ],
  },
  {
    id: "difficulty",
    label: "Filter by difficulty",
    placeholder: "Difficulty",
    options: [
      { value: "all", label: "All levels" },
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
  },
  {
    id: "topic",
    label: "Filter by topic",
    placeholder: "Topic",
    options: [
      { value: "all", label: "All topics" },
      { value: "mechanics", label: "Mechanics" },
      { value: "algebra", label: "Algebra" },
      { value: "optics", label: "Optics" },
    ],
  },
];

export default function QuestionBankPage() {
  const easy = questionBank.filter((q) => q.difficulty === "easy").length;
  const medium = questionBank.filter((q) => q.difficulty === "medium").length;
  const hard = questionBank.filter((q) => q.difficulty === "hard").length;

  return (
    <>
      <PageHeader
        title="Question bank"
        description="Your reusable library. Tag questions once, then pull them into any exam you build."
        actions={
          <>
            <Button variant="outline" className="h-9" disabled>
              <SendIcon aria-hidden="true" />
              Import
              <ComingSoonBadge className="ml-1 hidden sm:inline-flex" />
            </Button>
            <Link
              href="/teacher/question-bank"
              className={cn(buttonVariants(), "h-9 bg-brand hover:bg-brand-hover")}
            >
              <PlusIcon aria-hidden="true" />
              Add question
            </Link>
          </>
        }
      />

      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total questions" value={String(questionBank.length)} hint="Across all courses" />
          <StatCard label="Easy" value={String(easy)} hint="Recall and definitions" />
          <StatCard label="Medium" value={String(medium)} hint="Applied reasoning" />
          <StatCard label="Hard" value={String(hard)} hint="Multi-step problems" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <Card>
          <CardContent>
            <DataToolbar
              searchLabel="Search questions"
              searchPlaceholder="Search question text…"
              filters={filters}
            />
          </CardContent>

          {questionBank.length === 0 ? (
            <EmptyState
              icon={LibraryIcon}
              title="Your question bank is empty"
              description="Add questions here and reuse them across exams, or import a whole sheet at once."
              action={
                <Link
                  href="/teacher/question-bank"
                  className={cn(buttonVariants(), "bg-brand hover:bg-brand-hover")}
                >
                  <PlusIcon aria-hidden="true" />
                  Add question
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {questionBank.map((question) => (
                <li
                  key={question.id}
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0 space-y-2">
                    <p className="text-sm font-medium text-pretty text-foreground">
                      {question.question}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[0.65rem]">
                        {question.course}
                      </Badge>
                      <Badge variant="secondary" className="text-[0.65rem]">
                        {question.topic}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {question.options} options · {question.marks}{" "}
                        {question.marks === 1 ? "mark" : "marks"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-xs text-muted-foreground">
                      Used in {question.usedInExams}{" "}
                      {question.usedInExams === 1 ? "exam" : "exams"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <PaginationBar
            from={1}
            to={questionBank.length}
            total={questionBank.length}
            label="questions"
          />
        </Card>
      </DashboardSection>
    </>
  );
}
