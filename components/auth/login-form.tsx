"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction } from "@/actions/auth.actions";
import { AuthError, AuthField, AuthSubmit } from "./auth-form";
import type { ActionResult } from "@/types/common";

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<null> | null,
    FormData
  >(loginAction, null);

  const failure = state && !state.success ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <AuthError message={failure?.message} />

      {/* Carried through the form so the redirect survives without a session. */}
      {returnTo ? <input type="hidden" name="next" value={returnTo} /> : null}

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

      <div className="flex flex-col gap-2">
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          errors={failure?.fieldErrors}
        />
        <Link
          href="/forgot-password"
          className="self-end rounded text-xs font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-brand-accent"
        >
          Forgot password?
        </Link>
      </div>

      <AuthSubmit pending={pending}>Sign in</AuthSubmit>
    </form>
  );
}
