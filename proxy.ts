import { NextResponse, type NextRequest } from "next/server";

import {
  homePathForRole,
  isInterstitialRoute,
  requiredRoleForPath,
} from "@/lib/auth/routes";
import { decodeSessionCookie } from "@/lib/auth/tokens";

/**
 * Route protection (Next.js 16 renamed Middleware to Proxy).
 *
 * This is an **optimistic** gate, and only that. It reads the HMAC-signed
 * session cookie — no database, because proxy runs on every request including
 * prefetches, and a query per prefetch would be a self-inflicted DoS.
 *
 * The signature means the `role` claim cannot be forged, but it can be *stale*:
 * a session revoked by a sign-in on another device still carries a valid-looking
 * cookie until it expires. Closing that window is the job of `lib/auth/dal.ts`,
 * which every protected page calls and which checks the database. Proxy exists
 * to make the common cases fast and to keep unauthenticated users off protected
 * URLs entirely.
 */

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-examora_session"
    : "examora_session";

/** Whether this looks like a browser loading a page, rather than a fetch/XHR. */
function isDocumentNavigation(request: NextRequest): boolean {
  if (request.method !== "GET") return false;
  if (request.headers.get("sec-fetch-mode") === "navigate") return true;
  if (request.headers.get("sec-fetch-dest") === "document") return true;

  return request.headers.get("accept")?.includes("text/html") ?? false;
}

function redirectToLogin(request: NextRequest, reason: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("reason", reason);

  // Preserve where they were heading, but only for GET page loads — replaying a
  // POST target after sign-in is not something the user asked for.
  if (request.method === "GET" && request.nextUrl.pathname !== "/") {
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  }

  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const session = decodeSessionCookie(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  // Signed-in users have no business on the login form; send them home. Left
  // alone if they still owe a password change, which the next branch handles.
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(homePathForRole(session.role), request.url));
  }

  if (isInterstitialRoute(pathname)) {
    if (!session) return redirectToLogin(request, "expired");
    return NextResponse.next();
  }

  const requiredRole = requiredRoleForPath(pathname);
  if (!requiredRole) return NextResponse.next();

  if (!session) return redirectToLogin(request, "expired");

  if (session.role !== requiredRole) {
    // A person who followed a link into the other role's area is redirected to
    // their own home rather than shown a dead end; a programmatic request gets a
    // plain 403, because there is nothing useful to redirect.
    //
    // Both signals are checked: `Sec-Fetch-*` is absent on non-browser clients
    // and `Accept` alone is a weak hint, but together they identify a real
    // top-level navigation. Neither is a security decision — the request is
    // refused either way — only a choice of how to say no.
    return isDocumentNavigation(request)
      ? NextResponse.redirect(new URL(homePathForRole(session.role), request.url))
      : new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Skip static assets and metadata routes — they are public by definition and
   * running the cookie check on each one is pure overhead.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
