import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { steps } from "@/lib/marketing/content";

/**
 * Four-step timeline: stacked and vertically threaded on small screens,
 * horizontal across four columns from `lg` up.
 */
export function HowItWorks() {
  return (
    <Section
      muted
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-y border-border"
    >
      <Container width="wide">
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How it works"
          title="From empty course to graded results in four steps"
          description="Most teachers run their first live exam on Examora the same day they sign up."
        />

        <RevealGroup stagger={0.12} className="relative mt-16">
          {/* Timeline threads — decorative, drawn behind the step markers. */}
          <div
            aria-hidden="true"
            className="absolute top-8 bottom-8 left-6 w-px bg-border lg:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute top-6 right-6 left-6 hidden h-px bg-border lg:block"
          />

          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <li key={step.title}>
                <RevealItem className="flex gap-5 lg:flex-col lg:gap-6">
                  <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-brand shadow-sm dark:text-brand-accent">
                    <step.icon className="size-5" aria-hidden="true" />
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[0.65rem] font-semibold text-white">
                      {index + 1}
                    </span>
                  </span>

                  <div className="pt-1 lg:pt-0">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </RevealItem>
              </li>
            ))}
          </ol>
        </RevealGroup>
      </Container>
    </Section>
  );
}
