import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ComingSoonBadge } from "./status-badge";
import type { QuickAction } from "@/lib/dashboard/placeholder-data";

/**
 * A shortcut tile on the dashboard home.
 *
 * A "coming soon" action renders as a `div`, not a disabled link: a link that
 * goes nowhere is still focusable and still announced as a link, which is worse
 * than not being a link at all.
 */
export function QuickActionCard({ action }: { action: QuickAction }) {
  const shared = cn(
    "group relative flex h-full flex-col gap-3 rounded-xl border border-border p-4 text-left transition-all duration-200",
    action.comingSoon
      ? "bg-muted/40 opacity-70"
      : "bg-card hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/8"
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand transition-colors dark:text-brand-accent",
            !action.comingSoon && "group-hover:bg-brand group-hover:text-white"
          )}
        >
          <action.icon className="size-4" aria-hidden="true" />
        </span>

        {action.comingSoon ? (
          <ComingSoonBadge />
        ) : (
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand dark:group-hover:text-brand-accent"
          />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{action.title}</p>
        <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
          {action.description}
        </p>
      </div>
    </>
  );

  if (action.comingSoon) {
    return (
      <div className={shared} aria-label={`${action.title} — coming soon`}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={action.href}
      className={cn(
        shared,
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
    >
      {body}
    </Link>
  );
}
