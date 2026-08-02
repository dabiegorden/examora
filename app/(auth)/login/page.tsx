import type { Metadata } from "next";
import { CircleCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "@/components/auth/login-form";
import { SIGN_OUT_MESSAGES, type SignOutReason } from "@/lib/auth/errors";
import { safeReturnPath } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Examora account.",
  robots: { index: false, follow: false },
};

function signOutMessage(reason: string | undefined): string | null {
  if (!reason) return null;
  return SIGN_OUT_MESSAGES[reason as SignOutReason] ?? null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const first = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const notice = signOutMessage(first("reason"));
  const justReset = first("reset") === "success";
  const returnTo = safeReturnPath(first("next")) ?? undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in to Examora
        </h1>
        <p className="text-sm text-muted-foreground">
          Students: use the credentials your teacher gave you.
        </p>
      </div>

      {justReset ? (
        <Alert>
          <CircleCheckIcon className="text-success" />
          <AlertDescription>
            Your password has been reset. Sign in with your new password.
          </AlertDescription>
        </Alert>
      ) : null}

      {notice ? (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <LoginForm returnTo={returnTo} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Examora has no public sign-up. Student accounts are created by teachers.
      </p>
    </div>
  );
}
