"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/marketing/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/marketing/content";

/** Sticky site header with a responsive, animated mobile menu. */
export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile sheet is open: trap scrolling and allow Escape to close.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="hidden sm:inline-flex" />

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "hidden h-9 px-3.5 text-sm md:inline-flex"
              )}
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "hidden h-9 bg-brand px-4 text-sm shadow-sm hover:bg-brand-hover md:inline-flex"
              )}
            >
              Get Started
            </Link>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
            >
              {open ? (
                <XIcon className="size-5" aria-hidden="true" />
              ) : (
                <MenuIcon className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <Container width="wide">
              <nav aria-label="Mobile" className="flex flex-col gap-1 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index + 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 w-full text-sm"
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants(),
                      "h-11 w-full bg-brand text-sm hover:bg-brand-hover"
                    )}
                  >
                    Get Started
                  </Link>
                  <div className="flex items-center justify-between px-1 pt-2 sm:hidden">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </nav>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
