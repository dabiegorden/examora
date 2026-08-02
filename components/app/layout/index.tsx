import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Layout primitives.
 *
 * Spacing and column counts are variants rather than free-form classes, so
 * every page uses the same rhythm instead of one-off `gap-[13px]` choices.
 */

const stackVariants = cva("flex", {
  variants: {
    direction: { vertical: "flex-col", horizontal: "flex-row" },
    gap: {
      none: "gap-0",
      xs: "gap-1.5",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    wrap: { true: "flex-wrap", false: "flex-nowrap" },
  },
  defaultVariants: { direction: "vertical", gap: "md", align: "stretch" },
});

export interface StackProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof stackVariants> {}

export function Stack({
  className,
  direction,
  gap,
  align,
  justify,
  wrap,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(stackVariants({ direction, gap, align, justify, wrap }), className)}
      {...props}
    />
  );
}

/** Horizontal stack — the common case gets its own name. */
export function Row({ className, ...props }: StackProps) {
  return (
    <Stack
      direction="horizontal"
      align="center"
      className={className}
      {...props}
    />
  );
}

/**
 * Responsive grid.
 *
 * `cols` is the count at the widest breakpoint; the grid steps down on its own
 * so callers never write a breakpoint chain. Ultra-wide screens are covered by
 * the `2xl` step rather than letting cards stretch indefinitely.
 */
const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
      6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
    },
    gap: { sm: "gap-3", md: "gap-4", lg: "gap-6" },
  },
  defaultVariants: { cols: 3, gap: "md" },
});

export interface GridProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap }), className)} {...props} />;
}

/**
 * Main column plus a narrower side column, stacking on small screens.
 *
 * `min-w-0` on both sides matters: without it a wide table or a long
 * unbreakable string makes the whole grid overflow instead of scrolling inside
 * its own panel.
 */
export function SplitLayout({
  children,
  aside,
  className,
  asideFirst = false,
}: {
  children: React.ReactNode;
  aside: React.ReactNode;
  className?: string;
  asideFirst?: boolean;
}) {
  return (
    <div className={cn("grid gap-4 xl:grid-cols-3", className)}>
      <div className={cn("min-w-0 xl:col-span-2", asideFirst && "xl:order-2")}>
        {children}
      </div>
      <div className={cn("min-w-0", asideFirst && "xl:order-1")}>{aside}</div>
    </div>
  );
}

/** Divider with an optional centred label. */
export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn("border-border", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <hr className="flex-1 border-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <hr className="flex-1 border-border" />
    </div>
  );
}

/**
 * Horizontal scroll container.
 *
 * Anything that cannot shrink — a wide table, a long tab strip — belongs in one
 * of these so the page body never scrolls sideways.
 */
export function ScrollX({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("w-full min-w-0 overflow-x-auto", className)} {...props} />;
}
