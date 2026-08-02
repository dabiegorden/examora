import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export interface DashboardCardProps {
  title?: string;
  description?: string;
  /** Control aligned to the card header, e.g. a "View all" link. */
  action?: ReactNode;
  children: ReactNode;
  /** Removes the content padding, for cards that hold a full-bleed table. */
  flush?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * The single card wrapper every dashboard panel uses.
 *
 * Exists so no page hand-rolls a `Card` + header + padding combination — that is
 * how the third table on the fourth page ends up 4px out of alignment.
 */
export function DashboardCard({
  title,
  description,
  action,
  children,
  flush = false,
  className,
  contentClassName,
}: DashboardCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      {title ? (
        <CardHeader className={cn(action && "flex items-start justify-between gap-4")}>
          <div className="min-w-0 space-y-0.5">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </CardHeader>
      ) : null}

      <CardContent className={cn(flush && "px-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export interface DashboardSectionProps {
  children: ReactNode;
  /** Staggers this section's entrance behind the ones above it. */
  delay?: number;
  className?: string;
}

/** Vertical rhythm wrapper with a subtle entrance, used between page blocks. */
export function DashboardSection({
  children,
  delay = 0,
  className,
}: DashboardSectionProps) {
  return (
    <Reveal immediate delay={delay} className={cn("space-y-4", className)}>
      {children}
    </Reveal>
  );
}
