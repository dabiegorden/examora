"use client";

import type { ReactNode } from "react";

import { Toaster, toast as toastManager } from "@/components/ui/toast";

/**
 * Toast helpers.
 *
 * A thin wrapper over the toast manager already in `components/ui/toast`
 * (Base UI's `createToastManager`). It is not a replacement — the styling,
 * icons, and viewport all still come from that component. This exists so calls
 * read as `notify.success("Saved")` instead of every feature reinventing the
 * shape of an options object.
 *
 * Note: this project has no Sonner dependency. Adding one would mean two toast
 * systems rendering two viewports, so these wrap what is already here.
 */

export interface NotifyOptions {
  description?: ReactNode;
  /** Milliseconds before auto-dismiss. `0` keeps it until dismissed. */
  duration?: number;
  /** Reuse an id to update an existing toast in place. */
  id?: string;
}

/**
 * Toast type strings.
 *
 * `components/ui/toast`'s `ToastIcon` switches on these exact values to pick an
 * icon, so they must not be renamed here.
 */
const TYPE = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  loading: "loading",
} as const;

function push(type: string, title: ReactNode, options: NotifyOptions = {}) {
  return toastManager.add({
    title,
    type,
    description: options.description,
    timeout: options.duration,
    ...(options.id ? { id: options.id } : {}),
  });
}

export const notify = {
  /** A completed action. Keep the title short; put detail in `description`. */
  success: (title: ReactNode, options?: NotifyOptions) =>
    push(TYPE.success, title, options),

  /**
   * A failure the user should act on.
   *
   * Defaults to no auto-dismiss: an error that vanishes before it is read is
   * worse than no error at all.
   */
  error: (title: ReactNode, options?: NotifyOptions) =>
    push(TYPE.error, title, { duration: 0, ...options }),

  warning: (title: ReactNode, options?: NotifyOptions) =>
    push(TYPE.warning, title, options),

  info: (title: ReactNode, options?: NotifyOptions) =>
    push(TYPE.info, title, options),

  /** Indeterminate progress. Returns the id so the caller can update it. */
  loading: (title: ReactNode, options?: NotifyOptions) =>
    push(TYPE.loading, title, { duration: 0, ...options }),

  /** Swaps a loading toast for its success or error result in place. */
  promise: <TValue,>(
    promise: Promise<TValue>,
    messages: { loading: string; success: string; error: string }
  ) => toastManager.promise(promise, messages),

  dismiss: (id?: string) => toastManager.close(id),
};

/**
 * Mounts the toast viewport.
 *
 * Toasts only appear where this is rendered. Put it once in the root layout to
 * enable them application-wide; it is deliberately not mounted for you, so this
 * phase changes no existing file.
 */
export function AppToaster(props: React.ComponentProps<typeof Toaster>) {
  return <Toaster {...props} />;
}
