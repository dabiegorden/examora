import type { Metadata } from "next";
import { AwardIcon, DownloadIcon, TrophyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DashboardCard,
  DashboardSection,
  DataToolbar,
  EmptyState,
  PageHeader,
  StatCard,
  type FilterConfig,
} from "@/components/dashboard";
import { ScoreDistribution } from "@/components/dashboard/score-distribution";
import { leaderboard, scoreDistribution } from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Results",
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
      { value: "chm101", label: "CHM101" },
      { value: "bio101", label: "BIO101" },
    ],
  },
  {
    id: "exam",
    label: "Filter by exam",
    placeholder: "Exam",
    options: [
      { value: "all", label: "All exams" },
      { value: "chem-quiz", label: "Periodic Table Quiz" },
      { value: "bio-cells", label: "Cell Structure" },
    ],
  },
];

const rankTone = ["text-amber-500", "text-zinc-400", "text-amber-700"];

export default function ResultsPage() {
  const graded = scoreDistribution.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <>
      <PageHeader
        title="Results"
        description="How your cohort performed. Scores are computed the moment an exam closes."
        actions={
          <Button variant="outline" className="h-9" disabled>
            <DownloadIcon aria-hidden="true" />
            Export CSV
          </Button>
        }
      />

      <DashboardSection delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Graded attempts" value={String(graded)} change={6.4} hint="Across 2 completed exams" />
          <StatCard label="Average score" value="71.8%" change={3.1} hint="Cohort mean" />
          <StatCard label="Pass rate" value="82%" change={1.9} hint="At or above 50%" />
          <StatCard label="Highest score" value="100%" hint="Sofia Rossi · CHM101" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <Card>
          <CardContent>
            <DataToolbar
              searchLabel="Search results"
              searchPlaceholder="Search by student…"
              filters={filters}
            />
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection delay={0.15}>
        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardCard
            title="Score distribution"
            description="How marks spread across the cohort."
            className="xl:col-span-2"
          >
            <ScoreDistribution buckets={scoreDistribution} />
          </DashboardCard>

          <DashboardCard
            title="Leaderboard"
            description="Top performers this term."
            action={
              <TrophyIcon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            }
          >
            {leaderboard.length === 0 ? (
              <EmptyState
                icon={AwardIcon}
                title="No results yet"
                description="Once an exam closes, ranked results appear here automatically."
              />
            ) : (
              <ol className="space-y-3">
                {leaderboard.map((entry) => (
                  <li key={entry.rank} className="flex items-center gap-3">
                    <span
                      className={
                        entry.rank <= 3
                          ? `w-5 shrink-0 text-sm font-semibold tabular-nums ${rankTone[entry.rank - 1]}`
                          : "w-5 shrink-0 text-sm font-medium tabular-nums text-muted-foreground"
                      }
                    >
                      {entry.rank}
                    </span>

                    <Avatar size="sm">
                      <AvatarFallback className="bg-brand-subtle text-[0.65rem] font-semibold text-brand dark:text-brand-accent">
                        {entry.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.course} · {entry.score}/{entry.total}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {entry.percentage}%
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </DashboardCard>
        </div>
      </DashboardSection>
    </>
  );
}
