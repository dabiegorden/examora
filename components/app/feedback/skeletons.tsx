import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeletons.
 *
 * Each mirrors the shape of what it replaces so nothing jumps when real content
 * arrives. Always wrap a group in `LoadingRegion`: it announces "loading" once
 * instead of letting a screen reader traverse dozens of empty boxes.
 */

/** Announces a loading state once and hides the placeholder boxes from AT. */
export function LoadingRegion({
  label = "Loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("space-y-6", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={i === lines - 1 ? "h-3 w-2/3" : "h-3 w-full"} />
        ))}
      </CardContent>
    </Card>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Table placeholder.
 *
 * Secondary columns are hidden below `sm`, matching how the real table drops
 * them — otherwise the skeleton is wider than the content it stands in for.
 */
export function TableSkeleton({
  rows = 6,
  columns = 4,
  toolbar = true,
}: {
  rows?: number;
  columns?: number;
  toolbar?: boolean;
}) {
  return (
    <Card>
      {toolbar ? (
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-full max-w-64" />
            <Skeleton className="hidden h-9 w-32 sm:block" />
          </div>
        </CardHeader>
      ) : null}

      <CardContent className="space-y-2">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton
                key={c}
                className={c === 0 ? "h-9 flex-[2]" : "hidden h-9 flex-1 sm:block"}
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card>
      <CardContent className="space-y-5">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Bars of varying height standing in for a chart. */
export function ChartSkeleton({ bars = 7 }: { bars?: number }) {
  const heights = ["h-16", "h-24", "h-32", "h-20", "h-40", "h-28", "h-36"];

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-2">
          {Array.from({ length: bars }, (_, i) => (
            <Skeleton key={i} className={cn("flex-1", heights[i % heights.length])} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Whole-dashboard placeholder: header, stats, cards, table. */
export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading dashboard">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <CardGridSkeleton count={3} />
      <TableSkeleton rows={5} />
    </LoadingRegion>
  );
}

/** Generic page placeholder for a route-level `loading.tsx`. */
export function PageSkeleton() {
  return (
    <LoadingRegion label="Loading page">
      <PageHeaderSkeleton />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={2} />
    </LoadingRegion>
  );
}
