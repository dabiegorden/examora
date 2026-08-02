import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { testimonials } from "@/lib/marketing/content";

/** Three quotes from educators already running exams on Examora. */
export function Testimonials() {
  return (
    <Section aria-labelledby="testimonials-heading">
      <Container width="wide">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Testimonials"
          title="Teachers got their evenings back"
          description="What changed for the people running examinations on Examora every term."
        />

        <RevealGroup
          stagger={0.1}
          className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <RevealItem key={testimonial.name} className="h-full">
              <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/8">
                <QuoteIcon
                  aria-hidden="true"
                  className="size-6 text-brand/30 dark:text-brand-accent/40"
                />

                <blockquote className="text-sm leading-relaxed text-pretty text-foreground/85">
                  {testimonial.quote}
                </blockquote>

                <figcaption className="flex items-center gap-3 border-t border-border pt-5">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-semibold text-brand dark:text-brand-accent"
                  >
                    {testimonial.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {testimonial.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
