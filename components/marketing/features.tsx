import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/layout/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { FeatureCard } from "@/components/marketing/feature-card";
import { features } from "@/lib/marketing/content";

/** The full capability grid. */
export function Features() {
  return (
    <Section id="features" aria-labelledby="features-heading">
      <Container width="wide">
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Everything an online examination needs"
          description="From the first question you write to the analytics you read afterwards — one platform, no add-ons, no spreadsheets on the side."
        />

        <RevealGroup
          stagger={0.05}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <RevealItem key={feature.title}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
