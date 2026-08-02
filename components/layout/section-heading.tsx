import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export interface SectionHeadingProps {
  /** Small label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Heading level — keeps the document outline correct per section. */
  as?: "h2" | "h3";
  align?: "center" | "left";
  className?: string;
  /** Ties the section's `aria-labelledby` to this heading. */
  id?: string;
}

/** Eyebrow + title + supporting copy, shared by every marketing section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  align = "center",
  className,
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        centered ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full border border-brand/15 bg-brand-subtle px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase dark:text-brand-accent">
          {eyebrow}
        </span>
      ) : null}

      <Heading
        id={id}
        className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
      >
        {title}
      </Heading>

      {description ? (
        <p className="text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
