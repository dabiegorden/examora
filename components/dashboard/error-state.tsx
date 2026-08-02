"use client";

import { CircleAlertIcon, RotateCcwIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Wired to the `reset` function Next passes into an `error.tsx` boundary. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Failure panel for route error boundaries.
 *
 * Deliberately never renders the raw error: a stack trace or a driver message
 * tells a teacher nothing and can leak internals. The real error is logged by
 * the boundary that catches it.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "This section could not be loaded. Try again, and if it keeps happening, contact support.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("items-start", className)}>
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>

        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            <RotateCcwIcon />
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
