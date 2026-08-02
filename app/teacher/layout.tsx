import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requirePasswordChanged, requireTeacher } from "@/lib/auth/dal";

/**
 * Authorization boundary for everything under `/teacher`.
 *
 * `proxy.ts` already turned away requests without a teacher cookie, but that was
 * an optimistic check against a signed cookie that can be stale. This is the
 * real one: it hits the database, so a session revoked by a sign-in elsewhere
 * stops working here even though the cookie still looks valid.
 *
 * The dashboard shell is mounted around that guard, so no page can render
 * outside it and every page inherits the sidebar, header, and footer.
 */
export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireTeacher();
  await requirePasswordChanged(user);

  // The sidebar writes its open/closed state to a cookie. Reading it here means
  // the server renders the correct width immediately instead of flashing the
  // default and snapping once the client hydrates.
  const sidebarState = (await cookies()).get("sidebar_state")?.value;

  return (
    <SidebarProvider defaultOpen={sidebarState !== "false"}>
      <AppSidebar user={user} />

      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <DashboardHeader user={user} />

        {/* `min-w-0` on the scroll parent stops a wide table from forcing the
            whole page to scroll horizontally. */}
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
          {children}
        </div>

        <DashboardFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
