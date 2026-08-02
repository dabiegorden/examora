import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/marketing/content";

/**
 * Monogram + wordmark, non-interactive. Inline SVG so it costs no network
 * request, stays crisp at any size, and inherits the current theme.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-transform duration-300 group-hover/logo:scale-105"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M5 4.5h14v15H5z" opacity={0.35} />
          <path d="M8.5 12.2l2.6 2.6 5-5.4" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {siteConfig.name}
      </span>
    </span>
  );
}

/** The logo as a link back to the homepage. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "group/logo inline-flex rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <LogoMark />
    </Link>
  );
}
