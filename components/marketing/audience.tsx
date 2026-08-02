import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { FeatureCard } from "@/components/marketing/feature-card";
import { audiences } from "@/lib/marketing/content";

/** Who Examora is for — four audience cards under a shared heading. */
export function Audience() {
  return (
    <Section
      muted
      aria-labelledby="audience-heading"
      className="border-y border-border"
    >
      <Container width="wide">
        <SectionHeading
          id="audience-heading"
          eyebrow="Built for educators"
          title="Made for the people who set the questions"
          description="Examora fits the way you already assess — whether you teach one class or run examinations across an entire institution."
        />

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience) => (
            <RevealItem key={audience.title}>
              <FeatureCard
                tone="solid"
                icon={audience.icon}
                title={audience.title}
                description={audience.description}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
