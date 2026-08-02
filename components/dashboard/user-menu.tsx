"use client";

import Link from "next/link";
import {
  BadgeCheckIcon,
  LifeBuoyIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

import { logoutAction } from "@/actions/auth.actions";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsFor } from "@/utils/text";
import type { User } from "@/types/db";

export function UserIdentity({ user, className }: { user: User; className?: string }) {
  return (
    <>
      <Avatar className={className}>
        <AvatarFallback className="bg-brand-subtle text-xs font-semibold text-brand dark:text-brand-accent">
          {initialsFor(user.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-medium">{user.fullName}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </>
  );
}

/**
 * The shared body of the account dropdown, used by both the header avatar and
 * the sidebar footer so the two menus can never drift apart.
 */
export function UserMenuItems({ user }: { user: User }) {
  return (
    <>
      {/*
        A plain div, not `DropdownMenuLabel`: that maps to Base UI's
        `Menu.GroupLabel`, which throws unless it sits inside a `Menu.Group` and
        is meant to name a set of items. This block identifies the account, it
        does not label the menu items below it.
      */}
      <div className="flex items-center gap-2 px-1.5 py-1.5">
        <UserIdentity user={user} />
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link href="/teacher/settings" />}>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/teacher/settings" />}>
          <SettingsIcon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/teacher/support" />}>
          <LifeBuoyIcon />
          Support
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem disabled>
        <BadgeCheckIcon />
        <span className="capitalize">{user.role} account</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {/*
        Sign-out is a form POST rather than a menu click handler: it must not be
        triggerable by a prefetch or a stray GET.
      */}
      <form action={logoutAction}>
        <DropdownMenuItem
          variant="destructive"
          // `Menu.Item` is button-like too: without `nativeButton` Base UI adds
          // its non-native activation shims on top of a real submit button,
          // which double-handles the click.
          nativeButton
          render={<button type="submit" className="w-full" />}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </form>
    </>
  );
}
