"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/actions/auth.actions";
import { AuthError, AuthField, AuthSubmit } from "./auth-form";
import type { ActionResult } from "@/types/common";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<null> | null,
    FormData
  >(resetPasswordAction, null);

  const failure = state && !state.success ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthError message={failure?.message} />

      {/* The token stays in the form rather than being re-read from the URL, so
          it is submitted exactly as issued. */}
      <input type="hidden" name="token" value={token} />

      <AuthField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        autoFocus
        required
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
        errors={failure?.fieldErrors}
      />

      <AuthField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={failure?.fieldErrors}
      />

      <AuthSubmit pending={pending}>Reset password</AuthSubmit>
    </form>
  );
}
