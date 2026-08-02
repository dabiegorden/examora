import Link from "next/link";
import { ArrowRightIcon, PlayIcon, SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { heroStats } from "@/lib/marketing/content";

/** Above-the-fold pitch: headline, dual CTA, and the product mockup. */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 lg:pt-24 lg:pb-32">
      {/* Ambient background — a faint grid that fades out, plus one soft glow. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] dark:opacity-20" />
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/8 blur-3xl dark:bg-brand/15" />
      </div>

      <Container width="wide">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* Copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Reveal immediate>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-subtle px-3.5 py-1.5 text-xs font-medium text-brand dark:text-brand-accent">
                <SparklesIcon className="size-3.5" aria-hidden="true" />
                Built for teachers, not administrators
              </span>
            </Reveal>

            <Reveal immediate delay={0.08}>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Secure online exams,{" "}
                <span className="text-brand dark:text-brand-secondary">
                  made simple.
                </span>
              </h1>
            </Reveal>

            <Reveal immediate delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                Examora gives you everything you need to run multiple-choice
                examinations online — a reusable question bank, bulk student
                imports, proctored sessions, and grading that finishes the
                moment the timer does.
              </p>
            </Reveal>

            <Reveal
              immediate
              delay={0.24}
              className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "group h-12 w-full bg-brand px-6 text-base shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover hover:shadow-brand/30 sm:w-auto"
                )}
              >
                Get Started Free
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="#demo"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 w-full px-6 text-base sm:w-auto"
                )}
              >
                <PlayIcon aria-hidden="true" className="size-4" />
                Watch Demo
              </Link>
            </Reveal>

            <Reveal
              immediate
              delay={0.32}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 lg:justify-start"
            >
              {heroStats.map((stat) => (
                <span
                  key={stat.label}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <stat.icon
                    aria-hidden="true"
                    className="size-4 text-brand dark:text-brand-accent"
                  />
                  {stat.label}
                </span>
              ))}
            </Reveal>

            <Reveal immediate delay={0.38}>
              <p className="mt-5 text-sm text-muted-foreground">
                Free for your first course. No card required.
              </p>
            </Reveal>
          </div>

          {/* Product mockup */}
          <DashboardPreview className="mx-auto w-full max-w-xl lg:max-w-none" />
        </div>
      </Container>
    </section>
  );
}
