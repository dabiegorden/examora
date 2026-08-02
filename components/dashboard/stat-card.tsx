import type { LucideIcon } from "lucide-react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string;
  /** Signed percentage change; omit when there is nothing to compare against. */
  change?: number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Single metric tile. The unit of the dashboard's top row. */
export function StatCard({
  label,
  value,
  change,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card
      className={cn(
        "transition-colors duration-200 hover:border-brand/20 hover:ring-brand/20",
        className
      )}
    >
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : null}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </span>

          {change !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              <TrendIcon className="size-3" aria-hidden="true" />
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
              {/* The arrow alone is not accessible; name the direction. */}
              <span className="sr-only">
                {isPositive ? "increase" : "decrease"} on the previous period
              </span>
            </span>
          ) : null}
        </div>

        {hint ? (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
