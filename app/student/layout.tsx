import type { ReactNode } from "react";

import { requirePasswordChanged, requireStudent } from "@/lib/auth/dal";

/** Authorization boundary for `/student`. See the note in the teacher layout. */
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { user } = await requireStudent();
  await requirePasswordChanged(user);

  return <>{children}</>;
}
