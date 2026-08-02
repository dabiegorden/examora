import { cn } from "@/lib/utils";
import {
  formatRelativeMinutes,
  type ActivityEntry,
} from "@/lib/dashboard/placeholder-data";

const toneStyles = {
  brand: "bg-brand-subtle text-brand dark:text-brand-accent",
  success: "bg-success/12 text-success",
  muted: "bg-muted text-muted-foreground",
} as const;

/**
 * Vertical activity feed.
 *
 * An ordered list, because the sequence is the meaning. The connecting rail is
 * drawn with a border on the list item rather than an absolutely positioned
 * element, so it grows with the content and stops cleanly at the last entry.
 */
export function ActivityTimeline({
  entries,
  className,
}: {
  entries: readonly ActivityEntry[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;

        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  toneStyles[entry.tone]
                )}
              >
                <entry.icon className="size-3.5" aria-hidden="true" />
              </span>
              {!isLast ? (
                <span aria-hidden="true" className="w-px flex-1 bg-border" />
              ) : null}
            </div>

            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeMinutes(entry.minutesAgo)}
                </time>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-pretty text-muted-foreground">
                {entry.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
