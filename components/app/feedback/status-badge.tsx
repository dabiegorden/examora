import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Status badges.
 *
 * `StatusBadge` is the generic primitive; the named badges below are thin maps
 * from a domain value to a tone. Adding a status means adding one entry, not a
 * new component, and every surface renders it identically.
 *
 * Colour is never the only signal — each badge always carries its text label,
 * so the meaning survives greyscale and colour-blindness.
 */

const statusBadgeVariants = cva("gap-1.5 border-transparent font-medium", {
  variants: {
    tone: {
      neutral: "bg-muted text-muted-foreground",
      brand: "bg-brand-subtle text-brand dark:text-brand-accent",
      success: "bg-success/12 text-success dark:bg-success/20",
      warning:
        "bg-amber-500/12 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300",
      danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
      info: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300",
    },
    size: {
      sm: "h-5 px-1.5 text-[0.65rem]",
      md: "h-6 px-2 text-xs",
    },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

export type StatusTone = NonNullable<
  VariantProps<typeof statusBadgeVariants>["tone"]
>;

export interface StatusBadgeProps
  extends Omit<React.ComponentProps<"span">, "children">,
    VariantProps<typeof statusBadgeVariants> {
  children: ReactNode;
  /** Leading dot. Turn off for badges that read as labels rather than states. */
  dot?: boolean;
  icon?: ReactNode;
}

export function StatusBadge({
  className,
  tone,
  size,
  dot = true,
  icon,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge className={cn(statusBadgeVariants({ tone, size }), className)} {...props}>
      {icon ?? (dot ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null)}
      {children}
    </Badge>
  );
}

/** Builds a badge component from a value→(tone,label) map. */
function createBadge<TValue extends string>(
  config: Record<TValue, { tone: StatusTone; label: string; dot?: boolean }>
) {
  return function MappedBadge({
    value,
    className,
    size,
  }: {
    value: TValue;
    className?: string;
    size?: VariantProps<typeof statusBadgeVariants>["size"];
  }) {
    const entry = config[value];
    return (
      <StatusBadge tone={entry.tone} size={size} dot={entry.dot ?? true} className={className}>
        {entry.label}
      </StatusBadge>
    );
  };
}

export const RoleBadge = createBadge({
  teacher: { tone: "brand", label: "Teacher", dot: false },
  student: { tone: "neutral", label: "Student", dot: false },
});

export const ExamStatusBadge = createBadge({
  draft: { tone: "neutral", label: "Draft" },
  published: { tone: "success", label: "Published" },
  completed: { tone: "brand", label: "Completed" },
});

export const StudentStatusBadge = createBadge({
  active: { tone: "success", label: "Active" },
  inactive: { tone: "neutral", label: "Inactive" },
  suspended: { tone: "danger", label: "Suspended" },
});

export const DifficultyBadge = createBadge({
  easy: { tone: "success", label: "Easy", dot: false },
  medium: { tone: "warning", label: "Medium", dot: false },
  hard: { tone: "danger", label: "Hard", dot: false },
});

export const AttemptStatusBadge = createBadge({
  in_progress: { tone: "info", label: "In progress" },
  submitted: { tone: "success", label: "Submitted" },
  auto_submitted: { tone: "warning", label: "Auto-submitted" },
});

/**
 * Live/idle indicator.
 *
 * The pulse is decorative; `aria-hidden` keeps a screen reader from announcing
 * an animation, while the label carries the meaning.
 */
export function ActivityBadge({
  active,
  activeLabel = "Live",
  idleLabel = "Idle",
  className,
}: {
  active: boolean;
  activeLabel?: string;
  idleLabel?: string;
  className?: string;
}) {
  return (
    <StatusBadge
      tone={active ? "success" : "neutral"}
      dot={false}
      className={className}
      icon={
        <span aria-hidden="true" className="relative flex size-1.5">
          {active ? (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          ) : null}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      }
    >
      {active ? activeLabel : idleLabel}
    </StatusBadge>
  );
}

/** Marks a control that is intentionally inert. */
export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <StatusBadge tone="brand" dot={false} size="sm" className={className}>
      Coming soon
    </StatusBadge>
  );
}

/** Small count pill for tabs and nav items. */
export function CountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <StatusBadge tone="neutral" dot={false} size="sm" className={cn("tabular-nums", className)}>
      {count > 99 ? "99+" : count}
    </StatusBadge>
  );
}
