import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { StudentRepository } from "@/repositories";
import type { Student, User, UserRole } from "@/types/db";
import { SIGN_OUT_REASON, type SignOutReason } from "./errors";
import { homePathForRole } from "./routes";
import { refreshSessionIfNeeded, validateSession } from "./session";

export { homePathForRole };

/**
 * Data Access Layer for authentication.
 *
 * This — not `proxy.ts` — is the authorization boundary. Proxy makes an
 * optimistic routing decision from a signed cookie; every server component,
 * server action, and route handler that touches protected data must call one of
 * the `require*` helpers, because a request can reach a page without passing
 * through proxy at all.
 *
 * `cache()` dedupes the lookup within a single render pass, so a layout and the
 * page beneath it calling `requireAuth()` costs one query, not two.
 */

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const validated = await validateSession();
  if (!validated) return null;

  await refreshSessionIfNeeded(validated);
  return validated.user;
});

function loginRedirect(reason?: SignOutReason, returnTo?: string): never {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (returnTo) params.set("next", returnTo);

  const query = params.toString();
  redirect(query ? `/login?${query}` : "/login");
}

/**
 * Require any signed-in user.
 *
 * `returnTo` is echoed back after sign-in. It is validated as a same-site
 * absolute path by the login action before use — an open redirect here would
 * turn the login page into a phishing hop.
 */
export const requireAuth = cache(async (returnTo?: string): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) loginRedirect(SIGN_OUT_REASON.EXPIRED, returnTo);
  return user;
});

/**
 * Require a specific role.
 *
 * A signed-in user with the wrong role is sent to their own home rather than the
 * login page: bouncing a perfectly valid session to /login reads as a bug to the
 * person using it.
 */
export const requireRole = cache(
  async (role: UserRole, returnTo?: string): Promise<User> => {
    const user = await requireAuth(returnTo);
    if (user.role !== role) redirect(homePathForRole(user.role));
    return user;
  }
);

export const requireTeacher = cache(
  async (returnTo?: string): Promise<User> => requireRole("teacher", returnTo)
);

/** A student user together with their student profile, which most reads need. */
export const requireStudent = cache(
  async (returnTo?: string): Promise<{ user: User; student: Student }> => {
    const user = await requireRole("student", returnTo);
    const student = await StudentRepository.findByUserId(user.id);

    // A student account with no profile row cannot do anything meaningful, and
    // it means provisioning half-failed. Treat it as no session at all.
    if (!student) loginRedirect(SIGN_OUT_REASON.DISABLED);

    return { user, student };
  }
);

/**
 * Guard for pages that a user must not reach until they have replaced a
 * generated password. Applied in the protected layouts.
 */
export async function requirePasswordChanged(user: User): Promise<void> {
  if (user.mustChangePassword) redirect("/change-password");
}
