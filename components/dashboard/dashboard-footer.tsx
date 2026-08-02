import Link from "next/link";

import { siteConfig } from "@/lib/marketing/content";

/** Quiet footer inside the content area, in the shape GitHub and Vercel use. */
export function DashboardFooter() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Support", href: "/teacher/support" },
    { label: "Settings", href: "/teacher/settings" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
  ];

  return (
    <footer className="mt-auto border-t border-border">
      <div className="flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row lg:px-6">
        <p className="text-xs text-muted-foreground">
          © {year} {siteConfig.name}. All rights reserved.
        </p>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
