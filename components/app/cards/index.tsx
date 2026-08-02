import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Card family.
 *
 * All of these wrap `components/ui/card`; none restyle a bare `div`. The
 * differences are in what they *say*, not how they are drawn, which is what
 * keeps radii, borders, and padding identical across the application.
 */

export interface AppCardProps
  // `title` is omitted from the DOM props: the HTML attribute is a string
  // tooltip, whereas this one is renderable header content.
  extends Omit<React.ComponentProps<typeof Card>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Control aligned to the header, e.g. a "View all" link. */
  action?: ReactNode;
  footer?: ReactNode;
  /** Removes content padding, for a full-bleed table. */
  flush?: boolean;
  contentClassName?: string;
}

/** The base panel every other card and most sections are built from. */
export function AppCard({
  title,
  description,
  action,
  footer,
  flush = false,
  className,
  contentClassName,
  children,
  ...props
}: AppCardProps) {
  return (
    <Card className={cn("h-full", className)} {...props}>
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

      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}

const trendVariants = cva("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", {
  variants: {
    direction: { up: "text-success", down: "text-destructive", flat: "text-muted-foreground" },
  },
  defaultVariants: { direction: "flat" },
});

export interface MetricCardProps {
  label: string;
  value: string;
  /** Signed percentage change. Omit when there is nothing to compare against. */
  change?: number;
  /**
   * Whether a rise is good. Inverted for metrics like "failed sign-ins", where
   * up is bad — otherwise the colour would tell the opposite of the truth.
   */
  invertTrend?: boolean;
  hint?: string;
  icon?: LucideIcon;
  /** Turns the whole tile into a link. */
  href?: string;
  className?: string;
}

/**
 * A single metric.
 *
 * The trend arrow is decorative; the direction is also stated in visually
 * hidden text so it is not colour- or glyph-only.
 */
export function MetricCard({
  label,
  value,
  change,
  invertTrend = false,
  hint,
  icon: Icon,
  href,
  className,
}: MetricCardProps) {
  const rising = change !== undefined && change >= 0;
  const good = invertTrend ? !rising : rising;
  const TrendIcon = rising ? TrendingUpIcon : TrendingDownIcon;

  const body = (
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
          <span className={trendVariants({ direction: good ? "up" : "down" })}>
            <TrendIcon className="size-3" aria-hidden="true" />
            {rising ? "+" : ""}
            {change.toFixed(1)}%
            <span className="sr-only">
              {rising ? "increase" : "decrease"} on the previous period
            </span>
          </span>
        ) : null}
      </div>

      {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
    </CardContent>
  );

  const shell = cn(
    "transition-colors duration-200",
    href && "hover:border-brand/20 hover:ring-brand/20",
    className
  );

  if (href) {
    return (
      <Card
        className={cn(shell, "outline-none focus-within:ring-3 focus-within:ring-ring/50")}
      >
        <Link href={href} className="outline-none">
          {body}
        </Link>
      </Card>
    );
  }

  return <Card className={shell}>{body}</Card>;
}

/** Alias kept because "stat" and "metric" are both in common use. */
export const StatCard = MetricCard;

export interface InformationCardProps {
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  tone?: "default" | "brand" | "warning";
  className?: string;
}

/** Explanatory panel — context, notes, or a short piece of guidance. */
export function InformationCard({
  icon: Icon,
  title,
  children,
  tone = "default",
  className,
}: InformationCardProps) {
  const tones = {
    default: "",
    brand: "border-brand/20 bg-brand-subtle/50",
    warning: "border-amber-500/25 bg-amber-500/5",
  } as const;

  return (
    <Card className={cn(tones[tone], className)}>
      <CardContent className="flex gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <div className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

/** Static capability tile — no action, unlike `ActionCard`. */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="space-y-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-subtle text-brand dark:text-brand-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export interface ActionCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  href: string;
  /** Overrides the default chevron affordance. */
  cta?: ReactNode;
  className?: string;
}

/**
 * A card that is entirely one link.
 *
 * The whole surface is the anchor, so the hit target matches what the hover
 * state implies — rather than a card that looks clickable but only responds on
 * a small "View" link in the corner.
 */
export function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
  className,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/8",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      {Icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand transition-colors group-hover:bg-brand group-hover:text-white dark:text-brand-accent">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {cta ?? (
        <ArrowRightIcon
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand dark:group-hover:text-brand-accent"
        />
      )}
    </Link>
  );
}

export interface AnalyticsCardProps {
  title: string;
  description?: string;
  /** Headline figure rendered above the body. */
  value?: string;
  change?: number;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper for a visualisation.
 *
 * Holds the title, headline figure, and framing; the chart itself is passed in
 * as children. This phase ships no charting logic.
 */
export function AnalyticsCard({
  title,
  description,
  value,
  change,
  action,
  children,
  className,
}: AnalyticsCardProps) {
  const rising = change !== undefined && change >= 0;
  const TrendIcon = rising ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}

          {value ? (
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {value}
              </span>
              {change !== undefined ? (
                <span className={trendVariants({ direction: rising ? "up" : "down" })}>
                  <TrendIcon className="size-3" aria-hidden="true" />
                  {rising ? "+" : ""}
                  {change.toFixed(1)}%
                  <span className="sr-only">
                    {rising ? "increase" : "decrease"} on the previous period
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
