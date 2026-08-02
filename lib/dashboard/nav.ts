import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

/**
 * Sidebar navigation.
 *
 * Declared as data rather than markup so the sidebar, the breadcrumb, and the
 * command palette all read the same source — a renamed route cannot leave one of
 * them pointing somewhere else.
 */

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Renders as a nested, collapsible menu. */
  items?: ReadonlyArray<Omit<NavItem, "icon" | "items">>;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

export const TEACHER_ROOT = "/teacher";

export const navGroups: readonly NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/teacher", icon: LayoutDashboardIcon },
    ],
  },
  {
    label: "Teaching",
    items: [
      { title: "Courses", href: "/teacher/courses", icon: BookOpenIcon },
      { title: "Students", href: "/teacher/students", icon: UsersIcon },
      {
        title: "Exams",
        href: "/teacher/exams",
        icon: ClipboardListIcon,
        items: [
          { title: "All exams", href: "/teacher/exams" },
          { title: "Question bank", href: "/teacher/question-bank" },
        ],
      },
      {
        title: "Results",
        href: "/teacher/results",
        icon: TrophyIcon,
        items: [
          { title: "Overview", href: "/teacher/results" },
          { title: "Analytics", href: "/teacher/analytics" },
        ],
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      // Question bank and Analytics are reachable as children of Exams and
      // Results above. Repeating them here would give the same route two
      // highlighted entries and make "where am I" ambiguous.
      { title: "Settings", href: "/teacher/settings", icon: SettingsIcon },
      { title: "Support", href: "/teacher/support", icon: LifeBuoyIcon },
    ],
  },
];

/** Flat list of every navigable route, used for breadcrumbs and search. */
export const allNavItems: ReadonlyArray<{ title: string; href: string }> =
  navGroups.flatMap((group) =>
    group.items.flatMap((item) => [
      { title: item.title, href: item.href },
      ...(item.items ?? []).map((child) => ({
        title: child.title,
        href: child.href,
      })),
    ])
  );

/**
 * Whether a nav entry should read as current.
 *
 * The dashboard root is matched exactly — every other route starts with
 * `/teacher`, so a prefix match would light up "Dashboard" everywhere.
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === TEACHER_ROOT) return pathname === TEACHER_ROOT;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True when any child of a nested item is active, so the group opens itself. */
export function hasActiveChild(pathname: string, item: NavItem): boolean {
  return (item.items ?? []).some((child) => isActiveRoute(pathname, child.href));
}

/** Human-readable label for a path segment, for the breadcrumb. */
export function labelForPath(href: string): string {
  const match = allNavItems.find((item) => item.href === href);
  if (match) return match.title;

  const segment = href.split("/").filter(Boolean).pop() ?? "";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
