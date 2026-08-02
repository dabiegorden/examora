import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type {
  DifficultyValue,
  ExamStatusValue,
  StudentStatusValue,
} from "@/lib/dashboard/placeholder-data";

/**
 * Status pills.
 *
 * One component for every status in the product, so "published" is the same
 * green in the exams table, the dashboard, and the results page. Colour is
 * always paired with a text label — never the only signal.
 */

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<Tone, string> = {
  brand: "bg-brand-subtle text-brand dark:text-brand-accent",
  success: "bg-success/12 text-success dark:bg-success/20",
  warning: "bg-amber-500/12 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  neutral: "bg-muted text-muted-foreground",
};

function Pill({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <Badge className={cn("gap-1.5 border-transparent", toneStyles[tone], className)}>
      {dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </Badge>
  );
}

const examTone: Record<ExamStatusValue, Tone> = {
  draft: "neutral",
  published: "success",
  completed: "brand",
};

const examLabel: Record<ExamStatusValue, string> = {
  draft: "Draft",
  published: "Published",
  completed: "Completed",
};

export function ExamStatusBadge({
  status,
  className,
}: {
  status: ExamStatusValue;
  className?: string;
}) {
  return (
    <Pill tone={examTone[status]} className={className}>
      {examLabel[status]}
    </Pill>
  );
}

const studentTone: Record<StudentStatusValue, Tone> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
};

const studentLabel: Record<StudentStatusValue, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export function StudentStatusBadge({
  status,
  className,
}: {
  status: StudentStatusValue;
  className?: string;
}) {
  return (
    <Pill tone={studentTone[status]} className={className}>
      {studentLabel[status]}
    </Pill>
  );
}

const difficultyTone: Record<DifficultyValue, Tone> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

const difficultyLabel: Record<DifficultyValue, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: DifficultyValue;
  className?: string;
}) {
  return (
    <Pill tone={difficultyTone[difficulty]} dot={false} className={className}>
      {difficultyLabel[difficulty]}
    </Pill>
  );
}

export function ArchivedBadge({ className }: { className?: string }) {
  return (
    <Pill tone="neutral" dot={false} className={className}>
      Archived
    </Pill>
  );
}

/** Marks a control that is deliberately inert in this phase. */
export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <Pill tone="brand" dot={false} className={className}>
      Coming soon
    </Pill>
  );
}
