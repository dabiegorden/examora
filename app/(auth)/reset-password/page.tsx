import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? raw[0] : raw;

  // The token is not verified here on purpose. Checking it on page load would
  // let anyone probe which links are live, and would spend a round trip before
  // the user has typed anything. It is validated when the form is submitted.
  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Link incomplete
          </h1>
        </div>

        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>
            This reset link is missing its token. Request a new one.
          </AlertDescription>
        </Alert>

        <Link
          href="/forgot-password"
          className="rounded text-center text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-brand-accent"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a password you have not used on Examora before.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
