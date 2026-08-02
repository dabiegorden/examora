import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  BookOpenIcon,
  ClipboardListIcon,
  DatabaseIcon,
  InboxIcon,
  LibraryIcon,
  SearchXIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Empty states.
 *
 * `EmptyState` is the primitive. The presets below exist so "no students yet"
 * reads the same everywhere, and so a list never ships the lazy version of this
 * — a dead end with no way forward.
 */

const emptyVariants = cva("", {
  variants: {
    size: {
      sm: "px-4 py-8",
      md: "px-6 py-14",
      lg: "px-6 py-20",
    },
  },
  defaultVariants: { size: "md" },
});

export interface EmptyStateProps extends VariantProps<typeof emptyVariants> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary action. Every empty state should offer one where one exists. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  secondaryAction,
  size,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={cn(emptyVariants({ size }), className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-brand-subtle text-brand dark:text-brand-accent"
        >
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>

      {action || secondaryAction ? (
        <EmptyContent className="flex flex-col items-center gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

type PresetProps = Omit<EmptyStateProps, "icon" | "title" | "description"> & {
  title?: string;
  description?: string;
};

function preset(icon: LucideIcon, title: string, description: string) {
  return function Preset({ title: t, description: d, ...rest }: PresetProps) {
    return (
      <EmptyState icon={icon} title={t ?? title} description={d ?? description} {...rest} />
    );
  };
}

export const NoData = preset(
  DatabaseIcon,
  "Nothing here yet",
  "Once there is data to show, it will appear here."
);

/**
 * Distinct from `NoData` on purpose: "no results for your search" needs a
 * different message and a *clear filters* action, not a *create* action.
 */
export function NoSearchResults({
  query,
  onReset,
  className,
  size,
}: {
  query?: string;
  onReset?: ReactNode;
  className?: string;
  size?: EmptyStateProps["size"];
}) {
  return (
    <EmptyState
      icon={SearchXIcon}
      title={query ? `No results for “${query}”` : "No matching results"}
      description="Try a different search term, or clear the filters you have applied."
      action={onReset}
      className={className}
      size={size}
    />
  );
}

export const NoCourses = preset(
  BookOpenIcon,
  "No courses yet",
  "Create your first course to start adding students and building exams."
);

export const NoStudents = preset(
  UsersIcon,
  "No students yet",
  "Add students individually, or import a whole class from a roster."
);

export const NoExams = preset(
  ClipboardListIcon,
  "No exams yet",
  "Build a paper from your question bank, then publish it to your class."
);

export const NoQuestions = preset(
  LibraryIcon,
  "Your question bank is empty",
  "Add questions here once and reuse them across every exam you build."
);

export const NoResults = preset(
  TrophyIcon,
  "No results yet",
  "Once students submit an exam, their scores and rankings appear here."
);
