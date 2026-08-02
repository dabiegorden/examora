import type { UserRole } from "@/types/db";

/**
 * Route→role map, shared by `proxy.ts` and the auth pages so the two can never
 * disagree about which prefix belongs to whom.
 *
 * Kept free of Node-only imports: proxy loads this module too.
 */

export const ROUTE_ROLES: ReadonlyArray<{ prefix: string; role: UserRole }> = [
  { prefix: "/teacher", role: "teacher" },
  { prefix: "/student", role: "student" },
];

/** Reachable while signed out. */
export const PUBLIC_ROUTES: readonly string[] = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
];

/**
 * Signed in but not yet allowed into the app — the forced password change lives
 * here, so it is not treated as a protected route that redirects back to itself.
 */
export const AUTH_INTERSTITIAL_ROUTES: readonly string[] = ["/change-password"];

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** The role a path demands, or null when the path is not role-restricted. */
export function requiredRoleForPath(pathname: string): UserRole | null {
  return ROUTE_ROLES.find((entry) => matches(pathname, entry.prefix))?.role ?? null;
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => matches(pathname, route));
}

export function isInterstitialRoute(pathname: string): boolean {
  return AUTH_INTERSTITIAL_ROUTES.some((route) => matches(pathname, route));
}

export function homePathForRole(role: UserRole): string {
  return role === "teacher" ? "/teacher" : "/student";
}

/**
 * Accept a post-login redirect target only if it is a same-site absolute path.
 *
 * Rejects `//evil.com` and `https://evil.com`, both of which browsers follow off
 * site. Without this the `next` parameter is an open redirect.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  return value;
}
