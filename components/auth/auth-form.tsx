"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FieldErrors } from "@/types/common";

/**
 * Shared building blocks for the auth forms.
 *
 * Each form differs only in its fields, so the error plumbing, accessible
 * labelling, and pending state live here once.
 */

export interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  /** Messages for this field, keyed by name in the action result. */
  errors?: FieldErrors;
  hint?: string;
}

export function AuthField({
  label,
  name,
  errors,
  hint,
  className,
  ...props
}: AuthFieldProps) {
  const messages = errors?.[name];
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const invalid = Boolean(messages?.length);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        name={name}
        aria-invalid={invalid || undefined}
        // Points at whichever helper text exists, so screen readers announce the
        // reason alongside the field rather than leaving it as a bare red border.
        aria-describedby={
          [invalid ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn("h-10", className)}
        {...props}
      />

      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {messages?.length ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {messages[0]}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level failure banner. `role="alert"` comes from the Alert primitive. */
export function AuthError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function AuthSubmit({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-brand text-sm hover:bg-brand-hover"
    >
      {pending ? "Please wait…" : children}
    </Button>
  );
}
