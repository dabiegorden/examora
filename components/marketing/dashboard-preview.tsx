import {
  CheckCheckIcon,
  ClockIcon,
  LockIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

interface LiveStudent {
  name: string;
  initials: string;
  progress: number;
  status: "writing" | "submitted";
}

const liveStudents: readonly LiveStudent[] = [
  { name: "Ama Boateng", initials: "AB", progress: 100, status: "submitted" },
  { name: "Kwesi Owusu", initials: "KO", progress: 72, status: "writing" },
  { name: "Lena Fischer", initials: "LF", progress: 58, status: "writing" },
  { name: "Ravi Sharma", initials: "RS", progress: 100, status: "submitted" },
];

interface StatTile {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  meta: string;
}

const stats: readonly StatTile[] = [
  { icon: UsersIcon, label: "Submitted", value: "38", meta: "of 42 students" },
  { icon: TrendingUpIcon, label: "Average", value: "76%", meta: "+6% vs last" },
  { icon: ClockIcon, label: "Time left", value: "12:40", meta: "auto-submits" },
];

/**
 * Decorative product mockup for the hero, assembled from real UI primitives
 * rather than a screenshot so it stays crisp, themeable, and weightless.
 *
 * Exposed to assistive tech as a single labelled image — the figures inside are
 * illustrative and would only add noise if read out one by one.
 */
export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Preview of the Examora teacher dashboard, showing live exam progress, submission stats, and automatic grading."
      className={cn("relative", className)}
    >
      {/* Soft brand glow behind the panel. */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-brand/10 blur-3xl dark:bg-brand/20"
      />

      <Reveal
        immediate
        direction="left"
        delay={0.2}
        className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-brand/10 dark:shadow-black/40"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          </span>
          <span className="mx-auto hidden items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[0.7rem] text-muted-foreground sm:inline-flex">
            <LockIcon className="size-3" />
            examora.app/exams/live
          </span>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          {/* Exam header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[0.9rem] font-semibold text-foreground">
                Physics — Mid-Term Assessment
              </p>
              <p className="text-xs text-muted-foreground">
                40 questions · 45 minutes · Grade 11
              </p>
            </div>
            <Badge className="gap-1.5 bg-success/12 text-success dark:bg-success/20">
              <span className="size-1.5 rounded-full bg-success" />
              Live now
            </Badge>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <stat.icon className="size-3.5" />
                  <span className="truncate text-[0.7rem] font-medium">
                    {stat.label}
                  </span>
                </div>
                <p className="mt-1.5 text-xl font-semibold tracking-tight tabular-nums text-foreground">
                  {stat.value}
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground">
                  {stat.meta}
                </p>
              </div>
            ))}
          </div>

          {/* Live progress list */}
          <Card size="sm" className="bg-background ring-border">
            <CardHeader>
              <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Live progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveStudents.map((student) => (
                <div key={student.name} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-[0.65rem] font-semibold text-brand dark:text-brand-accent">
                    {student.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-medium text-foreground">
                        {student.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[0.65rem] tabular-nums",
                          student.status === "submitted"
                            ? "text-success"
                            : "text-muted-foreground"
                        )}
                      >
                        {student.status === "submitted"
                          ? "Submitted"
                          : `${student.progress}%`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          student.status === "submitted"
                            ? "bg-success"
                            : "bg-brand"
                        )}
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Floating accent cards */}
      <Reveal
        immediate
        delay={0.55}
        direction="down"
        className="absolute -top-5 -right-3 hidden sm:block lg:-right-8"
      >
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
          <span className="flex size-8 items-center justify-center rounded-lg bg-success/12 text-success">
            <CheckCheckIcon className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              38 papers graded
            </p>
            <p className="text-[0.7rem] text-muted-foreground">
              in under a second
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal
        immediate
        delay={0.7}
        direction="up"
        className="absolute -bottom-6 -left-3 hidden sm:block lg:-left-10"
      >
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent">
            <ShieldCheckIcon className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Session locked
            </p>
            <p className="text-[0.7rem] text-muted-foreground">
              1 device per student
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
