import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons or controls aligned to the end; wraps below the title on mobile. */
  actions?: ReactNode;
  className?: string;
}

/** Title block at the top of every dashboard page. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <Reveal
      immediate
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </Reveal>
  );
}

export interface SectionTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Heading level, so each page keeps a correct outline under its `h1`. */
  as?: "h2" | "h3";
  className?: string;
}

/** Smaller heading used above a card, table, or group within a page. */
export function SectionTitle({
  title,
  description,
  action,
  as: Heading = "h2",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-0.5">
        <Heading className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
