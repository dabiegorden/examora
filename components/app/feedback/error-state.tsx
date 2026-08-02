"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  CircleAlertIcon,
  LifeBuoyIcon,
  RotateCcwIcon,
  WifiOffIcon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmptyState } from "./empty-state";

/**
 * Error states.
 *
 * A user-facing message is always written by us. Raw error text is only ever
 * shown inside the collapsed "technical details" block, and only when a caller
 * explicitly passes it — a stack trace or driver message tells a teacher
 * nothing and can leak internals.
 */

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Wired to the `reset` function from a Next `error.tsx` boundary. */
  onRetry?: () => void;
  /** Opaque identifier a user can quote to support. */
  reference?: string;
  /** Shown only inside the collapsed details block. */
  details?: string;
  className?: string;
}

function SupportDetails({
  reference,
  details,
}: {
  reference?: string;
  details?: string;
}) {
  if (!reference && !details) return null;

  return (
    <Collapsible className="mt-3">
      <CollapsibleTrigger
        render={
          <Button variant="ghost" size="xs" className="group/details -ml-1.5" />
        }
      >
        <ChevronDownIcon
          aria-hidden="true"
          className="transition-transform group-aria-expanded/details:rotate-180"
        />
        Technical details
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-3">
          {reference ? (
            <p className="text-xs text-muted-foreground">
              Reference:{" "}
              <code className="font-mono text-foreground">{reference}</code>
            </p>
          ) : null}
          {details ? (
            <pre className="max-h-40 overflow-auto text-xs whitespace-pre-wrap text-muted-foreground">
              {details}
            </pre>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Quote this reference when contacting{" "}
            <Link
              href="/teacher/support"
              className="underline underline-offset-2 hover:text-foreground"
            >
              support
            </Link>
            .
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Inline failure banner — for a panel that failed inside a working page. */
export function ErrorState({
  title = "Something went wrong",
  description = "This section could not be loaded. Try again, and if it keeps happening, contact support.",
  onRetry,
  reference,
  details,
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
            <RotateCcwIcon aria-hidden="true" />
            Try again
          </Button>
        ) : null}

        <SupportDetails reference={reference} details={details} />
      </AlertDescription>
    </Alert>
  );
}

/** Full-panel failure — for a whole page or an empty table body. */
export function ErrorPanel({
  title = "We could not load this",
  description = "The request did not complete. This is usually temporary.",
  onRetry,
  reference,
  details,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14", className)}>
      <EmptyState
        icon={CircleAlertIcon}
        title={title}
        description={description}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              <RotateCcwIcon aria-hidden="true" />
              Try again
            </Button>
          ) : undefined
        }
        secondaryAction={
          // `nativeButton={false}` because this renders an <a>, not a <button>.
          // Base UI otherwise assumes a real button and skips the role and
          // keyboard handling a link-as-button needs.
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/teacher/support" />}
          >
            <LifeBuoyIcon aria-hidden="true" />
            Contact support
          </Button>
        }
      />

      <div className="w-full max-w-sm">
        <SupportDetails reference={reference} details={details} />
      </div>
    </div>
  );
}

/** Specific, actionable copy for the offline case. */
export function OfflineState({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={WifiOffIcon}
      title="You appear to be offline"
      description="Check your connection. Any work in progress is saved and will sync when you reconnect."
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcwIcon aria-hidden="true" />
            Retry
          </Button>
        ) : undefined
      }
      className={className}
    />
  );
}
