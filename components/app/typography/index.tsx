import type { ElementType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Typography scale.
 *
 * Every text style in the application comes from here, so a change to the scale
 * happens in one place rather than across two hundred `text-sm` literals.
 *
 * Level and element are separate props on purpose: `<Heading level={2}>` picks
 * the *size*, `as` picks the *tag*. A page can render a visually small heading
 * that is still an `<h2>` in the document outline, which is what keeps the
 * outline correct without fighting the design.
 */

const headingVariants = cva("font-semibold tracking-tight text-balance text-foreground", {
  variants: {
    level: {
      1: "text-2xl sm:text-3xl",
      2: "text-xl sm:text-2xl",
      3: "text-lg",
      4: "text-base",
    },
  },
  defaultVariants: { level: 2 },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

export interface HeadingProps
  extends Omit<React.ComponentProps<"h2">, "color">,
    VariantProps<typeof headingVariants> {
  /** Overrides the tag without changing the visual size. */
  as?: HeadingTag;
}

export function Heading({ className, level, as, ...props }: HeadingProps) {
  const Tag = (as ?? (`h${level ?? 2}` as HeadingTag)) as ElementType;
  return <Tag className={cn(headingVariants({ level }), className)} {...props} />;
}

/** Secondary heading — the line that sits under a `Heading`. */
export function SubHeading({ className, as, ...props }: HeadingProps) {
  const Tag = (as ?? "h3") as ElementType;
  return (
    <Tag
      className={cn(
        "text-sm font-medium tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

/** Small uppercase label above a group — the "PRODUCT" style eyebrow. */
export function SectionHeading({
  className,
  as,
  ...props
}: React.ComponentProps<"h2"> & { as?: HeadingTag }) {
  const Tag = (as ?? "h2") as ElementType;
  return (
    <Tag
      className={cn(
        "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  );
}

const textVariants = cva("", {
  variants: {
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      brand: "text-brand dark:text-brand-accent",
      success: "text-success",
      danger: "text-destructive",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
    },
  },
  defaultVariants: { tone: "default", size: "sm", weight: "normal" },
});

export interface TextProps
  extends Omit<React.ComponentProps<"p">, "color">,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

/** The general-purpose text element. `Muted`, `Small`, and `Caption` wrap it. */
export function Text({ className, tone, size, weight, as, ...props }: TextProps) {
  const Tag = (as ?? "p") as ElementType;
  return (
    <Tag className={cn(textVariants({ tone, size, weight }), className)} {...props} />
  );
}

export function Muted({ className, ...props }: TextProps) {
  return <Text tone="muted" className={cn("leading-relaxed", className)} {...props} />;
}

export function Small({ className, ...props }: TextProps) {
  return <Text size="xs" className={className} {...props} />;
}

/** Smallest tier — timestamps, helper notes, table footnotes. */
export function Caption({ className, ...props }: TextProps) {
  return <Text size="xs" tone="muted" className={className} {...props} />;
}

/**
 * Non-form label. For inputs use `components/ui/label`, which wires `htmlFor`
 * and the disabled/peer states this one deliberately does not carry.
 */
export function TextLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

/** Number styled for alignment in tables and metric tiles. */
export function NumericText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("tabular-nums", className)} {...props} />;
}

/** Truncates to a line count without collapsing the layout. */
export function Clamp({
  lines = 2,
  className,
  children,
}: {
  lines?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  const clamp = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const;
  return <span className={cn(clamp[lines], className)}>{children}</span>;
}
