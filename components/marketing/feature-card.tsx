import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** `subtle` fills the icon chip; `solid` gives the card a stronger surface. */
  tone?: "subtle" | "solid";
  className?: string;
}

/**
 * The single card used by the Features, Audience, and Security grids so all
 * three read as one family instead of three separate designs.
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  tone = "subtle",
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-border p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/8",
        tone === "solid" ? "bg-card" : "bg-background",
        className
      )}
    >
      {/* Brand wash that fades in on hover. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-subtle/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-subtle text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white dark:text-brand-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
