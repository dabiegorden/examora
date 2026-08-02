import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Heading, Muted } from "@/components/app/typography";
import { SlideUp } from "@/components/app/motion";

/**
 * Page scaffolding.
 *
 * Every application page is `AppPage` → `PageHeader` → one or more `Section`s.
 * Vertical rhythm and heading levels come from here, so pages cannot drift
 * apart by a few pixels or accidentally ship two `<h1>`s.
 */

const containerVariants = cva("mx-auto w-full min-w-0", {
  variants: {
    width: {
      /** Forms and prose — long lines are hard to read. */
      narrow: "max-w-3xl",
      /** Standard content width. */
      default: "max-w-6xl",
      /** Dense tables and dashboards. */
      wide: "max-w-[110rem]",
      /** Fills the shell; the dashboard layout already provides gutters. */
      full: "max-w-none",
    },
  },
  defaultVariants: { width: "full" },
});

export interface PageContainerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof containerVariants> {}

export function PageContainer({ className, width, ...props }: PageContainerProps) {
  return <div className={cn(containerVariants({ width }), className)} {...props} />;
}

export interface AppPageProps extends PageContainerProps {
  children: ReactNode;
}

/** Root wrapper for a page's content. Sets the spacing between blocks. */
export function AppPage({ className, width, children, ...props }: AppPageProps) {
  return (
    <PageContainer
      width={width}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {children}
    </PageContainer>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Buttons aligned to the end; wraps beneath the title on small screens. */
  actions?: ReactNode;
  /** Small label above the title — a breadcrumb substitute or category. */
  eyebrow?: ReactNode;
  /** Tabs or a filter row rendered beneath the title block. */
  children?: ReactNode;
  className?: string;
  /**
   * Heading level. Defaults to `h1`: there is one page title per page, and it
   * should be the document's only level-one heading.
   */
  as?: "h1" | "h2";
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  children,
  className,
  as = "h1",
}: PageHeaderProps) {
  return (
    <SlideUp className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <div className="text-xs font-medium text-muted-foreground">{eyebrow}</div>
          ) : null}
          <PageTitle as={as}>{title}</PageTitle>
          {description ? <PageDescription>{description}</PageDescription> : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {children}
    </SlideUp>
  );
}

export function PageTitle({
  className,
  as = "h1",
  ...props
}: React.ComponentProps<"h1"> & { as?: "h1" | "h2" }) {
  return <Heading level={1} as={as} className={className} {...props} />;
}

export function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <Muted className={cn("max-w-3xl", className)} {...props} />;
}

export interface SectionProps extends React.ComponentProps<"section"> {
  /** Staggers this section behind the ones above it. */
  delay?: number;
  /** Skips the entrance animation — use inside already-animated containers. */
  static?: boolean;
}

/**
 * A block within a page.
 *
 * Renders a real `<section>`; pair it with `SectionHeader`'s `id` and
 * `aria-labelledby` when the section needs an accessible name.
 */
export function Section({
  className,
  delay = 0,
  static: isStatic = false,
  children,
  ...props
}: SectionProps) {
  const content = (
    <section className={cn("flex min-w-0 flex-col gap-4", className)} {...props}>
      {children}
    </section>
  );

  if (isStatic) return content;

  return (
    <SlideUp delay={delay} className="min-w-0">
      {content}
    </SlideUp>
  );
}

export interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Ties a section's `aria-labelledby` to this heading. */
  id?: string;
  className?: string;
  as?: "h2" | "h3";
}

export function SectionHeader({
  title,
  description,
  action,
  id,
  className,
  as = "h2",
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-0.5">
        <SectionTitle id={id} as={as}>
          {title}
        </SectionTitle>
        {description ? <SectionDescription>{description}</SectionDescription> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({
  className,
  as = "h2",
  ...props
}: React.ComponentProps<"h2"> & { as?: "h2" | "h3" }) {
  return <Heading level={4} as={as} className={className} {...props} />;
}

export function SectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <Muted className={className} {...props} />;
}

/**
 * Action bar pinned to the bottom of the viewport.
 *
 * For long forms, where the save button would otherwise sit far below the fold.
 * `sticky` rather than `fixed` so it stays inside the content column and does
 * not cover the sidebar, and it carries safe-area padding for notched phones.
 */
export function StickyPageActions({
  children,
  className,
  visible = true,
}: {
  children: ReactNode;
  className?: string;
  /** Hidden until a form is dirty, in the usual "unsaved changes" pattern. */
  visible?: boolean;
}) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-2 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 sm:-mx-6 sm:px-6",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}
