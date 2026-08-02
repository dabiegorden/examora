import type { Metadata } from "next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireAuth } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

/**
 * The first-login interstitial, also reachable voluntarily.
 *
 * Not under `/teacher` or `/student` on purpose: a user who must change their
 * password is barred from both areas, so hanging this off either one would mean
 * the layout guard redirecting the page to itself.
 */
export default async function ChangePasswordPage() {
  const user = await requireAuth();
  const isInitial = user.mustChangePassword;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isInitial ? "Choose your password" : "Change your password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email}
        </p>
      </div>

      {isInitial ? (
        <Alert>
          <AlertDescription>
            You are using a temporary password. Set your own to continue.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ChangePasswordForm isInitial={isInitial} />
      </div>
    </div>
  );
}
