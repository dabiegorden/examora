import type { Metadata } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/layout/container";
import { requireStudent } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Student",
  robots: { index: false, follow: false },
};

/**
 * Placeholder so the student route exists and its protection is testable.
 * The exam experience is a later phase.
 */
export default async function StudentHomePage() {
  const { user, student } = await requireStudent();

  return (
    <Container className="py-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Student area
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.fullName} · {student.studentNumber}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Authentication is in place. Your exams will appear here in a later
            phase.
          </p>
        </div>
      </div>
    </Container>
  );
}
