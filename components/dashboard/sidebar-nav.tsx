"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  hasActiveChild,
  isActiveRoute,
  navGroups,
  type NavItem,
} from "@/lib/dashboard/nav";

/**
 * Grouped sidebar navigation with support for one level of nesting.
 *
 * Active state is derived from `usePathname` rather than tracked in state, so a
 * back/forward navigation or a hard reload highlights the right entry without a
 * separate sync step.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) =>
              item.items?.length ? (
                <NestedItem key={item.title} item={item} pathname={pathname} />
              ) : (
                <FlatItem key={item.title} item={item} pathname={pathname} />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

/** Closes the mobile sheet after navigating; a no-op on desktop. */
function useDismissOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();
  return React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);
}

function FlatItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const dismiss = useDismissOnNavigate();
  const active = isActiveRoute(pathname, item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.title}
        render={
          <Link href={item.href} onClick={dismiss} aria-current={active ? "page" : undefined} />
        }
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NestedItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const dismiss = useDismissOnNavigate();
  const childActive = hasActiveChild(pathname, item);

  const [open, setOpen] = React.useState(childActive);

  // Opens itself when navigation makes one of its children current, so a deep
  // link never lands the user inside a collapsed group.
  //
  // Adjusted during render rather than in an effect: React re-runs this
  // component immediately with the new state, before anything paints, so there
  // is no flash of a collapsed group and no extra commit.
  const [wasChildActive, setWasChildActive] = React.useState(childActive);
  if (childActive !== wasChildActive) {
    setWasChildActive(childActive);
    if (childActive) setOpen(true);
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            isActive={childActive}
            tooltip={item.title}
            className="group/collapsible"
          />
        }
      >
        <item.icon />
        <span>{item.title}</span>
        <ChevronRightIcon
          aria-hidden="true"
          className="ml-auto transition-transform duration-200 group-aria-expanded/collapsible:rotate-90"
        />
      </CollapsibleTrigger>

      {/*
        `keepMounted` leaves the sub-links in the DOM while collapsed (hidden,
        so they stay out of the tab order). Without it, a route that only exists
        as a child — Question bank, Analytics — is absent from the page whenever
        its parent is closed, which breaks find-in-page and leaves the markup
        claiming those routes do not exist.
      */}
      <CollapsibleContent keepMounted>
        <SidebarMenuSub>
          {item.items?.map((child) => {
            const active = isActiveRoute(pathname, child.href);

            return (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  isActive={active}
                  render={
                    <Link
                      href={child.href}
                      onClick={dismiss}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                >
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
