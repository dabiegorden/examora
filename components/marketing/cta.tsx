import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";

/** Closing call to action. */
export function Cta() {
  return (
    <Section aria-labelledby="cta-heading" className="pb-20 sm:pb-24 lg:pb-28">
      <Container width="wide">
        <Reveal className="relative overflow-hidden rounded-3xl bg-brand px-6 py-16 text-center sm:px-12 sm:py-20 lg:py-24">
          {/* Depth without a heavy gradient: one soft light source, one grid. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-white/12 blur-3xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
          </div>

          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <h2
              id="cta-heading"
              className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl lg:leading-[1.1]"
            >
              Run your next exam on Examora
            </h2>

            <p className="mt-5 text-base leading-relaxed text-pretty text-white/80 sm:text-lg">
              Create a course, import your class, and publish your first
              multiple-choice paper today. Your first course is free, and no
              card is needed to start.
            </p>

            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "group h-12 w-full bg-white px-6 text-base font-semibold text-brand shadow-lg hover:bg-white/90 focus-visible:ring-white/50 sm:w-auto"
                )}
              >
                Get Started Free
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 w-full border-white/25 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/50 sm:w-auto dark:border-white/25 dark:bg-transparent dark:hover:bg-white/10"
                )}
              >
                Talk to us
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Set up in minutes · No installation · Cancel anytime
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
