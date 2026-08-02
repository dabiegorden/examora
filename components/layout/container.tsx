import type * as React from "react";

import { cn } from "@/lib/utils";

type ContainerWidth = "default" | "narrow" | "wide";

const widths: Record<ContainerWidth, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

export interface ContainerProps extends React.ComponentProps<"div"> {
  /** Horizontal max-width preset. */
  width?: ContainerWidth;
}

/**
 * Page gutter + max-width wrapper used by every marketing section so the
 * horizontal rhythm stays identical from 320px through 1920px.
 */
export function Container({
  className,
  width = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        widths[width],
        className
      )}
      {...props}
    />
  );
}
