import { ShieldCheckIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { FeatureCard } from "@/components/marketing/feature-card";
import { securityControls } from "@/lib/marketing/content";

/** Integrity controls — the section that has to earn the reader's trust. */
export function Security() {
  return (
    <Section id="security" aria-labelledby="security-heading">
      <Container width="wide">
        <SectionHeading
          id="security-heading"
          eyebrow="Security"
          title="Integrity you can defend afterwards"
          description="Every exam is a locked session with a complete record behind it. When a result is questioned, you have the evidence rather than an opinion."
        />

        <RevealGroup
          stagger={0.05}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {securityControls.map((control) => (
            <RevealItem key={control.title}>
              <FeatureCard
                tone="solid"
                icon={control.icon}
                title={control.title}
                description={control.description}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand/15 bg-brand-subtle px-6 py-6 text-center sm:flex-row sm:text-left">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <ShieldCheckIcon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm leading-relaxed text-pretty text-foreground/80">
              <span className="font-semibold text-foreground">
                Encrypted in transit and at rest.
              </span>{" "}
              Exams, question banks, and student records are isolated per
              account and visible only to the roles you grant. Your data is
              never used to train models or shared with third parties.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
