"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The mounted flag never changes after hydration, so there is nothing to subscribe to. */
const subscribeNoop = () => () => {};

/**
 * Light/dark switch. Renders a stable placeholder until mounted so the server
 * and client markup match (the resolved theme is unknown during SSR).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // `false` on the server, `true` once hydrated — without a setState-in-effect.
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? (
          <SunIcon aria-hidden="true" />
        ) : (
          <MoonIcon aria-hidden="true" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
