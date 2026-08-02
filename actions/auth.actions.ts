"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthService } from "@/services/auth.service";
import { getCurrentUser, requireAuth } from "@/lib/auth/dal";
import { homePathForRole, safeReturnPath } from "@/lib/auth/routes";
import { toUserMessage } from "@/lib/errors";
import { flattenZodError } from "@/utils/validation";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  setInitialPasswordSchema,
} from "@/validators/auth";
import type { ActionResult } from "@/types/common";
import { err, ok } from "@/types/common";
import type { z } from "zod";

/**
 * Authentication server actions.
 *
 * Each one validates, delegates to `AuthService`, and returns an
 * `ActionResult` the form can render. Redirects are thrown by `redirect()`
 * *after* the try/catch — Next implements it by throwing a control-flow signal,
 * so calling it inside a `try` would have the catch swallow the navigation.
 */

async function requestContext() {
  const headerList = await headers();

  return {
    // `x-forwarded-for` is only meaningful behind a trusted proxy. Recorded for
    // audit context, never used for an access decision.
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip"),
    userAgent: headerList.get("user-agent"),
  };
}

function fieldErrorResult(error: z.ZodError): ActionResult<never> {
  return err({
    message: "Please correct the highlighted fields.",
    code: "VALIDATION",
    fieldErrors: flattenZodError(error),
  });
}

export async function loginAction(
  _prev: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) return fieldErrorResult(parsed.error);

  let destination: string;

  try {
    const context = await requestContext();
    const user = await AuthService.signIn(
      { email: parsed.data.email, password: parsed.data.password },
      context
    );

    destination = user.mustChangePassword
      ? "/change-password"
      : (safeReturnPath(parsed.data.next) ?? homePathForRole(user.role));
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }

  redirect(destination);
}

export async function logoutAction(): Promise<never> {
  const user = await getCurrentUser();
  await AuthService.signOut(user?.id);
  redirect("/login");
}

export async function changePasswordAction(
  _prev: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const user = await requireAuth();

  // A user with a generated password has already proven it at sign-in, so they
  // get the shorter form. Everyone else must re-enter their current password.
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  try {
    const context = await requestContext();

    if (user.mustChangePassword) {
      const parsed = setInitialPasswordSchema.safeParse(raw);
      if (!parsed.success) return fieldErrorResult(parsed.error);

      await AuthService.setInitialPassword(user, parsed.data.newPassword, context);
    } else {
      const parsed = changePasswordSchema.safeParse(raw);
      if (!parsed.success) return fieldErrorResult(parsed.error);

      await AuthService.changePassword(
        user,
        {
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
        },
        context
      );
    }
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }

  redirect(homePathForRole(user.role));
}

/**
 * Request a reset link.
 *
 * Succeeds identically for known and unknown addresses — the response must not
 * reveal whether an account exists.
 *
 * Delivery is not wired up yet. In development the link is logged to the server
 * console so the flow is testable; in production the token is discarded until an
 * email transport is added, rather than being exposed anywhere a user could read
 * it.
 */
export async function forgotPasswordAction(
  _prev: ActionResult<{ devResetUrl?: string }> | null,
  formData: FormData
): Promise<ActionResult<{ devResetUrl?: string }>> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fieldErrorResult(parsed.error);

  try {
    const context = await requestContext();
    const issued = await AuthService.requestPasswordReset(parsed.data.email, context);

    if (issued && process.env.NODE_ENV !== "production") {
      const url = `/reset-password?token=${issued.token}`;
      console.info(`[examora] password reset link for ${issued.user.email}: ${url}`);
      return ok({ devResetUrl: url });
    }

    return ok({});
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }
}

export async function resetPasswordAction(
  _prev: ActionResult<null> | null,
  formData: FormData
): Promise<ActionResult<null>> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return fieldErrorResult(parsed.error);

  try {
    await AuthService.resetPassword({
      token: parsed.data.token,
      newPassword: parsed.data.newPassword,
    });
  } catch (error) {
    return err({ message: toUserMessage(error) });
  }

  // Deliberately not signed in automatically: proving control of the reset link
  // is not the same as proving the new password works.
  redirect("/login?reset=success");
}
