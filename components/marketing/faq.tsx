import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { faqs } from "@/lib/marketing/content";

/**
 * Accordion FAQ. `hiddenUntilFound` keeps every answer in the DOM, so browser
 * find-in-page and search crawlers can reach collapsed content.
 */
export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-heading">
      <Container width="narrow">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Questions teachers ask us first"
          description="If something here is still unclear, we would rather you asked before your first exam than after."
        />

        <Reveal className="mt-14">
          <Accordion
            hiddenUntilFound
            className="rounded-2xl border border-border bg-card px-5 sm:px-6"
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="gap-6 py-5 text-base font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pr-8 pb-5 text-sm leading-relaxed text-pretty text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        <Reveal className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Still have a question?{" "}
            <Link
              href="/contact"
              className="font-medium text-brand underline-offset-4 hover:underline dark:text-brand-accent"
            >
              Talk to the team
            </Link>
            .
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
