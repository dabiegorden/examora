"use client";

import type * as React from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";

import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Client-side providers for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation on the site
 * honour `prefers-reduced-motion` without each component opting in.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider>{children}</TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
