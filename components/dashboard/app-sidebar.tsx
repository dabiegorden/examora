import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/marketing/logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import type { User } from "@/types/db";

/**
 * The dashboard sidebar.
 *
 * A Server Component: only the pieces that need the current path or interaction
 * (`SidebarNav`, `SidebarUser`) are client components, so the shell itself costs
 * no JavaScript.
 */
export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Examora"
              className="hover:bg-transparent active:bg-transparent"
              render={<Link href="/teacher" aria-label="Examora dashboard home" />}
            >
              {/* The wordmark hides itself when the rail collapses to icons. */}
              <LogoMark className="gap-2 group-data-[collapsible=icon]:gap-0 [&>span:last-child]:group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>

      {/* Drag handle for resizing/toggling on desktop. */}
      <SidebarRail />
    </Sidebar>
  );
}
