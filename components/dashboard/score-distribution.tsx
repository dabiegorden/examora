import { cn } from "@/lib/utils";
import type { DistributionBucket } from "@/lib/dashboard/placeholder-data";

/**
 * Score distribution as a bar chart.
 *
 * Drawn with plain elements rather than a charting library: this phase ships
 * placeholders, and a handful of proportional bars needs neither a canvas nor
 * the bundle weight. It also stays readable to assistive tech — the figures are
 * in the DOM as text, which a canvas chart cannot offer.
 */
export function ScoreDistribution({
  buckets,
  className,
}: {
  buckets: readonly DistributionBucket[];
  className?: string;
}) {
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <ul className="space-y-2.5">
        {buckets.map((bucket) => {
          const share = total > 0 ? Math.round((bucket.count / total) * 100) : 0;

          return (
            <li key={bucket.band} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
                {bucket.band}
              </span>

              <div className="h-6 min-w-0 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className="flex h-full items-center justify-end rounded-md bg-brand/85 px-2 transition-[width] duration-500"
                  style={{ width: `${(bucket.count / max) * 100}%` }}
                >
                  {bucket.count > 0 ? (
                    <span className="text-[0.65rem] font-medium text-white tabular-nums">
                      {bucket.count}
                    </span>
                  ) : null}
                </div>
              </div>

              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {share}%
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        {total} graded attempts. Live charts arrive with the analytics phase.
      </p>
    </div>
  );
}
