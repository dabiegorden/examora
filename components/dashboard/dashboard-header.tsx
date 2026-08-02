import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";
import { NotificationsMenu } from "./notifications-menu";
import { SearchBar } from "./search-bar";
import { UserMenuItems } from "./user-menu";
import { initialsFor } from "@/utils/text";
import type { User } from "@/types/db";

/**
 * Sticky top bar: sidebar toggle, breadcrumb, search, and account controls.
 *
 * Stays a Server Component; only the interactive islands inside it ship JS.
 */
export function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/85 backdrop-blur-md transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/70">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-1 data-vertical:h-4 sm:mr-2"
        />

        <DashboardBreadcrumb />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <SearchBar className="w-9 justify-center px-0 lg:w-56 lg:justify-start lg:px-3" />
          <NotificationsMenu />
          <ThemeToggle />

          <DropdownMenu>
            {/*
              `nativeButton` tells Base UI the rendered element really is a
              <button>, so it skips the ARIA and keyboard shims it would
              otherwise add for a non-button trigger. Without it Base UI warns
              and double-handles activation.
            */}
            <DropdownMenuTrigger
              nativeButton
              render={
                <button
                  type="button"
                  aria-label="Account menu"
                  className="ml-0.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              }
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-brand-subtle text-xs font-semibold text-brand dark:text-brand-accent">
                  {initialsFor(user.fullName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-(--anchor-width) min-w-56 rounded-lg"
            >
              <UserMenuItems user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
