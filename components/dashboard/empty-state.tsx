import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Primary action — an empty state without a way forward is a dead end. */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

/** Friendly zero-data state, used by every list and table on the dashboard. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={cn("px-6 py-14", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-brand-subtle text-brand dark:text-brand-accent">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
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
