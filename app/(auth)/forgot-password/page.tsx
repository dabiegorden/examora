import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your Examora account.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we will send you a link to set a new password.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
