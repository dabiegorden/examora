import type * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionProps extends React.ComponentProps<"section"> {
  /** Adds a faint tinted background to break up consecutive white bands. */
  muted?: boolean;
}

/**
 * Vertical rhythm wrapper. Every landing section uses this so spacing scales
 * consistently across breakpoints.
 */
export function Section({ className, muted, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "relative py-20 sm:py-24 lg:py-32",
        muted && "bg-muted/40 dark:bg-muted/20",
        className
      )}
      {...props}
    />
  );
}
