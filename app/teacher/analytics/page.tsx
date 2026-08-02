import type { Metadata } from "next";
import { BarChart3Icon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DashboardCard,
  DashboardSection,
  PageHeader,
  StatCard,
} from "@/components/dashboard";
import { ScoreDistribution } from "@/components/dashboard/score-distribution";
import {
  scoreDistribution,
  topicPerformance,
} from "@/lib/dashboard/placeholder-data";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

/** Colour-codes a correct-rate so weak topics stand out at a glance. */
function rateTone(rate: number): string {
  if (rate >= 75) return "bg-success";
  if (rate >= 55) return "bg-amber-500";
  return "bg-destructive";
}

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Where your cohort is strong, and which topics keep costing them marks."
      />

      <DashboardSection delay={0.05}>
        <Alert>
          <InfoIcon />
          <AlertTitle>Placeholder data</AlertTitle>
          <AlertDescription>
            These figures are illustrative. Real analytics are computed from
            attempts once the exam engine ships.
          </AlertDescription>
        </Alert>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Questions answered" value="1,050" change={9.3} hint="Last 30 days" />
          <StatCard label="Mean correct rate" value="68%" change={2.4} hint="All topics" />
          <StatCard label="Weakest topic" value="47%" change={-5.2} hint="Logarithms · MTH101" />
          <StatCard label="Median duration" value="31m" change={-1.8} hint="Per completed attempt" />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.15}>
        <Tabs defaultValue="topics">
          <TabsList>
            <TabsTrigger value="topics">By topic</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="mt-4">
            <DashboardCard
              title="Topic performance"
              description="Correct-answer rate across every question tagged to a topic."
            >
              <ul className="space-y-4">
                {topicPerformance.map((topic) => (
                  <li key={`${topic.course}-${topic.topic}`} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {topic.topic}
                        </span>
                        <Badge variant="outline" className="font-mono text-[0.65rem]">
                          {topic.course}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {topic.correctRate}%
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${rateTone(topic.correctRate)}`}
                        style={{ width: `${topic.correctRate}%` }}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {topic.attempts} attempts
                    </p>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            <DashboardCard
              title="Score distribution"
              description="How marks spread across the cohort."
            >
              <ScoreDistribution buckets={scoreDistribution} />
            </DashboardCard>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-subtle text-brand dark:text-brand-accent">
                  <BarChart3Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-foreground">
                  Trends arrive with the analytics phase
                </p>
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">
                  Term-over-term charts need graded attempts to plot. They will
                  appear here once students start sitting exams.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardSection>
    </>
  );
}
