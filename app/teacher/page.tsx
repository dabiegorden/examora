import type { Metadata } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/layout/container";
import { requireTeacher } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Teacher",
  robots: { index: false, follow: false },
};

/**
 * Placeholder so the teacher route exists and its protection is testable.
 * The dashboard is a later phase.
 */
export default async function TeacherHomePage() {
  const user = await requireTeacher();

  return (
    <Container className="py-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Teacher area
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {user.fullName} ({user.email})
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Authentication is in place. The teacher dashboard arrives in the next
            phase.
          </p>
        </div>
      </div>
    </Container>
  );
}
