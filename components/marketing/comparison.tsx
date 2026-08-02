import { CheckIcon, MinusIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { LogoMark } from "@/components/marketing/logo";
import { comparisonRows, siteConfig } from "@/lib/marketing/content";

/**
 * Examora vs. paper exams.
 *
 * A real `<table>` with proper scopes so screen readers announce each cell with
 * its row and column. The wrapper scrolls horizontally rather than letting the
 * page overflow on narrow screens.
 */
export function Comparison() {
  return (
    <Section
      muted
      id="why-examora"
      aria-labelledby="why-examora-heading"
      className="border-y border-border"
    >
      <Container>
        <SectionHeading
          id="why-examora-heading"
          eyebrow="Why Examora"
          title="The same exam, without the paperwork"
          description="Nothing here is about replacing your judgement as a teacher — only the parts of examining that never needed a human in the first place."
        />

        <Reveal className="mt-14">
          <div className="overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-160 border-collapse text-left">
              <caption className="sr-only">
                Comparison of running examinations with {siteConfig.name} versus
                traditional paper exams
              </caption>

              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="px-5 py-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6"
                  >
                    <span className="sr-only">Criterion</span>
                  </th>
                  <th
                    scope="col"
                    className="bg-brand-subtle/60 px-5 py-4 sm:px-6"
                  >
                    <LogoMark />
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 text-sm font-semibold text-muted-foreground sm:px-6"
                  >
                    Paper exams
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.criterion}
                    className="border-b border-border last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 text-sm font-medium text-foreground sm:px-6"
                    >
                      {row.criterion}
                    </th>

                    <td className="bg-brand-subtle/60 px-5 py-4 sm:px-6">
                      <span className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckIcon
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-brand dark:text-brand-accent"
                        />
                        {row.examora}
                      </span>
                    </td>

                    <td className="px-5 py-4 sm:px-6">
                      <span className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <MinusIcon
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 opacity-60"
                        />
                        {row.paper}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
