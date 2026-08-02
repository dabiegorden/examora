import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  ExternalLinkIcon,
  LifeBuoyIcon,
  MailIcon,
  MessageCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DashboardCard, DashboardSection, PageHeader } from "@/components/dashboard";
import { faqs } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
};

const channels = [
  {
    icon: MailIcon,
    title: "Email support",
    description: "We reply within one working day.",
    action: "support@examora.app",
    href: "mailto:support@examora.app",
    external: true,
  },
  {
    icon: MessageCircleIcon,
    title: "Live chat",
    description: "Weekdays, 09:00–17:00 GMT.",
    action: "Start a chat",
    href: "/teacher/support",
    external: false,
  },
  {
    icon: BookOpenIcon,
    title: "Documentation",
    description: "Guides for every part of Examora.",
    action: "Browse docs",
    href: "/docs",
    external: false,
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        title="Support"
        description="Stuck on something? Here is how to reach us and what other teachers ask most."
      />

      <DashboardSection delay={0.05}>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <li key={channel.title}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent">
                  <channel.icon className="size-4" aria-hidden="true" />
                </span>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{channel.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {channel.description}
                  </p>
                </div>

                <Link
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-auto h-9 w-full"
                  )}
                >
                  {channel.action}
                  {channel.external ? (
                    <ExternalLinkIcon aria-hidden="true" />
                  ) : null}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </DashboardSection>

      <DashboardSection delay={0.1}>
        <DashboardCard
          title="Frequently asked"
          description="The same answers as the public FAQ, kept in one place."
          action={
            <LifeBuoyIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          }
        >
          {/* `hiddenUntilFound` keeps collapsed answers reachable by Ctrl+F. */}
          <Accordion hiddenUntilFound>
            {faqs.slice(0, 6).map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pr-6 text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DashboardCard>
      </DashboardSection>
    </>
  );
}
