"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { labelForPath, TEACHER_ROOT } from "@/lib/dashboard/nav";

/**
 * Breadcrumb derived from the current path.
 *
 * Labels come from the nav config where a route is registered, falling back to a
 * title-cased segment, so a future detail route reads sensibly without needing
 * to be added anywhere.
 */
export function DashboardBreadcrumb() {
  const pathname = usePathname();

  const crumbs = React.useMemo(() => {
    if (pathname === TEACHER_ROOT) {
      return [{ href: TEACHER_ROOT, label: "Dashboard", isLast: true }];
    }

    const segments = pathname.replace(`${TEACHER_ROOT}/`, "").split("/").filter(Boolean);

    return [
      { href: TEACHER_ROOT, label: "Dashboard", isLast: false },
      ...segments.map((_, index) => {
        const href = `${TEACHER_ROOT}/${segments.slice(0, index + 1).join("/")}`;
        return {
          href,
          label: labelForPath(href),
          isLast: index === segments.length - 1,
        };
      }),
    ];
  }, [pathname]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem
              // Intermediate crumbs are dropped on narrow screens so the header
              // never wraps; the current page always stays visible.
              className={crumb.isLast ? undefined : "hidden md:inline-flex"}
            >
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
