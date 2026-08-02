"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ComingSoonBadge } from "@/components/app/feedback/status-badge";

/**
 * Action components.
 *
 * All of these compose `components/ui/button` rather than restyling a raw
 * `<button>`, so focus rings, disabled handling, and sizing stay identical to
 * the rest of the application.
 */

export interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  /** Announced while loading; the visible label does not change. */
  loadingLabel?: string;
  /** Renders as a link. Mutually exclusive with `onClick`. */
  href?: string;
}

/**
 * The standard action button.
 *
 * While loading it stays disabled and swaps the leading icon for a spinner —
 * the label is unchanged so the button does not resize mid-click, and the
 * status is announced through a live region rather than by moving text.
 */
export function ActionButton({
  icon: Icon,
  loading = false,
  loadingLabel = "Working…",
  href,
  children,
  className,
  disabled,
  render,
  ...props
}: ActionButtonProps) {
  const content = (
    <>
      {loading ? (
        <Spinner aria-hidden="true" />
      ) : Icon ? (
        <Icon aria-hidden="true" />
      ) : null}
      {children}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
    </>
  );

  const asLink = Boolean(href) && !render;

  return (
    <Button
      className={cn(className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      // A link is not a native button; telling Base UI otherwise makes it skip
      // the semantics an anchor-as-button needs.
      nativeButton={asLink ? false : undefined}
      render={render ?? (href ? <Link href={href} /> : undefined)}
      {...props}
    >
      {content}
    </Button>
  );
}

/** Primary brand-coloured action. */
export function PrimaryButton({ className, ...props }: ActionButtonProps) {
  return (
    <ActionButton
      className={cn("bg-brand hover:bg-brand-hover", className)}
      {...props}
    />
  );
}

/**
 * Destructive action.
 *
 * Defaults to the `destructive` variant and is meant to sit behind a
 * `DeleteDialog` rather than firing immediately.
 */
export function DangerButton({ className, ...props }: ActionButtonProps) {
  return <ActionButton variant="destructive" className={className} {...props} />;
}

export interface IconButtonProps
  extends Omit<ActionButtonProps, "children" | "icon"> {
  icon: LucideIcon;
  /** Required: an icon-only control has no visible text to name it. */
  label: string;
  /** Shows `label` in a tooltip as well as exposing it to assistive tech. */
  showTooltip?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  showTooltip = true,
  size = "icon",
  loading,
  className,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      size={size}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={props.disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? <Spinner aria-hidden="true" /> : <Icon aria-hidden="true" />}
    </Button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface SplitButtonProps {
  /** The default action, fired by the main half of the control. */
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  /** Secondary actions, revealed by the chevron half. */
  menu: ReactNode;
  menuLabel?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  className?: string;
}

/**
 * A primary action with a menu of alternatives.
 *
 * Two separate buttons rather than one with a nested trigger, so keyboard users
 * can reach the menu directly instead of having to activate the default action
 * to discover it.
 */
export function SplitButton({
  children,
  onClick,
  icon: Icon,
  menu,
  menuLabel = "More actions",
  variant = "default",
  disabled,
  className,
}: SplitButtonProps) {
  return (
    <div className={cn("inline-flex items-stretch", className)}>
      <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className="rounded-r-none border-r-0"
      >
        {Icon ? <Icon aria-hidden="true" /> : null}
        {children}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant={variant}
              size="icon"
              aria-label={menuLabel}
              disabled={disabled}
              className="rounded-l-none border-l border-l-black/10 dark:border-l-white/15"
            />
          }
        >
          <ChevronDownIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-(--anchor-width) min-w-44">
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Floating action button.
 *
 * Mobile-only by default: on desktop the same action lives in the page header,
 * and two of them on screen at once is a duplicate affordance.
 */
export function FloatingActionButton({
  icon: Icon = PlusIcon,
  label,
  onClick,
  href,
  className,
  mobileOnly = true,
}: {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  mobileOnly?: boolean;
}) {
  return (
    <Button
      size="icon-lg"
      aria-label={label}
      onClick={onClick}
      nativeButton={href ? false : undefined}
      render={href ? <Link href={href} /> : undefined}
      className={cn(
        "fixed right-4 z-40 size-12 rounded-full bg-brand shadow-lg shadow-brand/25 hover:bg-brand-hover",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        mobileOnly && "md:hidden",
        className
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
    </Button>
  );
}

const quickActionVariants = cva(
  "group relative flex h-full flex-col gap-3 rounded-xl border border-border p-4 text-left transition-all duration-200",
  {
    variants: {
      state: {
        interactive:
          "bg-card hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/8 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled: "bg-muted/40 opacity-70",
      },
    },
    defaultVariants: { state: "interactive" },
  }
);

export interface QuickActionCardProps
  extends VariantProps<typeof quickActionVariants> {
  icon: LucideIcon;
  title: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  /** Renders inert with a "Coming soon" badge. */
  comingSoon?: boolean;
  className?: string;
}

/**
 * A shortcut tile.
 *
 * When `comingSoon` is set it renders a `div`, not a disabled link: a link that
 * goes nowhere is still focusable and still announced as a link, which is worse
 * than not being a link at all.
 */
export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  comingSoon = false,
  className,
}: QuickActionCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand transition-colors dark:text-brand-accent",
            !comingSoon && "group-hover:bg-brand group-hover:text-white"
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {comingSoon ? <ComingSoonBadge /> : null}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <div
        className={cn(quickActionVariants({ state: "disabled" }), className)}
        aria-label={`${title} — coming soon`}
      >
        {body}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cn(quickActionVariants(), className)}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(quickActionVariants(), className)}
    >
      {body}
    </button>
  );
}
