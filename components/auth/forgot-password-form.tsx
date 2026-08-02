"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheckIcon } from "lucide-react";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthField, AuthSubmit } from "./auth-form";
import type { ActionResult } from "@/types/common";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ devResetUrl?: string }> | null,
    FormData
  >(forgotPasswordAction, null);

  const failure = state && !state.success ? state.error : undefined;

  // The success message is identical whether or not the address has an account,
  // so this form cannot be used to discover which emails are registered.
  if (state?.success) {
    return (
      <div className="flex flex-col gap-5">
        <Alert>
          <CircleCheckIcon className="text-success" />
          <AlertDescription>
            If that email has an Examora account, a reset link is on its way. The
            link expires in one hour.
          </AlertDescription>
        </Alert>

        {state.data.devResetUrl ? (
          <Alert>
            <AlertDescription className="break-all">
              <span className="font-medium">Development only:</span>{" "}
              <Link
                href={state.data.devResetUrl}
                className="text-brand underline underline-offset-4 dark:text-brand-accent"
              >
                {state.data.devResetUrl}
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        <Link
          href="/login"
          className="rounded text-center text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-brand-accent"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthError message={failure?.message} />

      <AuthField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        placeholder="you@school.edu"
        errors={failure?.fieldErrors}
      />

      <AuthSubmit pending={pending}>Send reset link</AuthSubmit>

      <Link
        href="/login"
        className="rounded text-center text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Back to sign in
      </Link>
    </form>
  );
}
