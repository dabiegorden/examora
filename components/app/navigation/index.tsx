"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollX } from "@/components/app/layout";
import { CountBadge } from "@/components/app/feedback/status-badge";

/**
 * Navigation components.
 *
 * Generic: none of these know the application's routes. A caller passes the
 * items, which is what lets the same components serve settings tabs, a wizard,
 * and a detail-page header.
 */

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail from an explicit list.
 *
 * Intermediate crumbs collapse on small screens so the bar never wraps; the
 * current page always stays visible, since that is the one that orients you.
 */
export function AppBreadcrumbs({
  items,
  className,
}: {
  items: readonly Crumb[];
  className?: string;
}) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem className={isLast ? undefined : "hidden md:inline-flex"}>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export interface TabItem {
  label: string;
  href: string;
  count?: number;
  disabled?: boolean;
}

/**
 * Route-backed tab strip.
 *
 * Real links rather than buttons, so each tab is shareable, opens in a new tab
 * with a middle click, and works before JavaScript loads. Active state is
 * derived from the pathname, so back/forward navigation stays in sync.
 */
export function AppTabNav({
  items,
  className,
  exact = false,
}: {
  items: readonly TabItem[];
  className?: string;
  /** Match the path exactly rather than by prefix. */
  exact?: boolean;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <ScrollX className={cn("border-b border-border", className)}>
      <nav aria-label="Section">
        <ul className="flex min-w-max items-center gap-1">
          {items.map((item) => {
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  className={cn(
                    "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-brand text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    item.disabled && "pointer-events-none opacity-50"
                  )}
                >
                  {item.label}
                  {item.count !== undefined ? <CountBadge count={item.count} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </ScrollX>
  );
}

/** "Back to …" link for a detail page. */
export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      // Renders an <a>; see the note in `feedback/error-state.tsx`.
      nativeButton={false}
      render={<Link href={href} />}
      className={cn("-ml-2 h-8 text-muted-foreground hover:text-foreground", className)}
    >
      <ArrowLeftIcon aria-hidden="true" />
      {label}
    </Button>
  );
}

export interface StepItem {
  label: string;
  description?: string;
}

/**
 * Progress indicator for a multi-step flow.
 *
 * An ordered list with `aria-current="step"`, so the position is available to
 * assistive tech rather than only implied by colour.
 */
export function AppSteps({
  steps,
  current,
  className,
}: {
  steps: readonly StepItem[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}) {
  return (
    <ScrollX className={className}>
      <ol className="flex min-w-max items-center gap-2" aria-label="Progress">
        {steps.map((step, index) => {
          const state =
            index < current ? "complete" : index === current ? "current" : "upcoming";

          return (
            <li key={step.label} className="flex items-center gap-2">
              <div
                aria-current={state === "current" ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    state === "complete" && "bg-brand text-white",
                    state === "current" && "bg-brand-subtle text-brand dark:text-brand-accent",
                    state === "upcoming" && "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {step.label}
                    <span className="sr-only">
                      {state === "complete"
                        ? " (completed)"
                        : state === "current"
                          ? " (current step)"
                          : ""}
                    </span>
                  </p>
                  {step.description ? (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  ) : null}
                </div>
              </div>

              {index < steps.length - 1 ? (
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground/60"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </ScrollX>
  );
}
