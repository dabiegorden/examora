import type { ReactNode } from "react";

import { Logo } from "@/components/marketing/logo";

/**
 * Shell for every authentication screen: a centred card on the same subtle grid
 * used by the landing hero, so signing in feels like the same product.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-5 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_50%_40%_at_50%_0%,black,transparent)] dark:opacity-20" />
      </div>

      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
