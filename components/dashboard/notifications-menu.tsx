"use client";

import { BellIcon, CheckCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  formatRelativeMinutes,
  notifications,
} from "@/lib/dashboard/placeholder-data";

/**
 * Notification bell.
 *
 * Placeholder for this phase: the list is static and nothing is marked read.
 * The shell is real so wiring a feed in later is a data change, not a redesign.
 */
export function NotificationsMenu() {
  const unread = notifications.filter((item) => item.unread).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
          />
        }
      >
        <BellIcon aria-hidden="true" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand ring-2 ring-background"
          />
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Notifications</span>
            {unread > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem]">
                {unread} new
              </Badge>
            ) : null}
          </div>
          <Button variant="ghost" size="xs" disabled>
            <CheckCheckIcon />
            Mark all
          </Button>
        </div>

        <Separator />

        <ScrollArea className="max-h-80">
          <ul className="divide-y divide-border">
            {notifications.map((item) => (
              <li key={item.id} className="flex gap-3 px-4 py-3">
                <span
                  aria-hidden="true"
                  className={
                    item.unread
                      ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                      : "mt-1.5 size-1.5 shrink-0 rounded-full bg-transparent"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    {formatRelativeMinutes(item.minutesAgo)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <Separator />

        <div className="p-2">
          <Button variant="ghost" className="w-full" disabled>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
