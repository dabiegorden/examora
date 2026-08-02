"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/actions/auth.actions";
import { AuthError, AuthField, AuthSubmit } from "./auth-form";
import type { ActionResult } from "@/types/common";

/**
 * @param isInitial Set for a user still on a generated password. They proved it
 * moments ago at sign-in, so the current-password field is omitted.
 */
export function ChangePasswordForm({ isInitial }: { isInitial: boolean }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<null> | null,
    FormData
  >(changePasswordAction, null);

  const failure = state && !state.success ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthError message={failure?.message} />

      {isInitial ? null : (
        <AuthField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          errors={failure?.fieldErrors}
        />
      )}

      <AuthField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        autoFocus={isInitial}
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

      <AuthSubmit pending={pending}>
        {isInitial ? "Set password and continue" : "Update password"}
      </AuthSubmit>
    </form>
  );
}
