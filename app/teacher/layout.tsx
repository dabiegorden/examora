import type { ReactNode } from "react";

import { requirePasswordChanged, requireTeacher } from "@/lib/auth/dal";

/**
 * Authorization boundary for everything under `/teacher`.
 *
 * `proxy.ts` already turned away requests without a teacher cookie, but that was
 * an optimistic check against a signed cookie that can be stale. This is the
 * real one: it hits the database, so a session revoked by a sign-in elsewhere
 * stops working here even though the cookie still looks valid.
 */
export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireTeacher();
  await requirePasswordChanged(user);

  return <>{children}</>;
}
