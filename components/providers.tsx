"use client";

import type * as React from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppToaster } from "@/components/app/feedback";

/**
 * Client-side providers for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation on the site
 * honour `prefers-reduced-motion` without each component opting in.
 *
 * `AppToaster` mounts the single toast viewport. Toasts only render where it
 * lives, and mounting it twice would show every notification twice, so it
 * belongs here and nowhere else.
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
        <TooltipProvider>
          {children}
          <AppToaster />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
