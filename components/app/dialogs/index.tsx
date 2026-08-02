"use client";

import * as React from "react";
import type { LucideIcon, } from "lucide-react";
import type { ReactNode } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader as UIDialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

/**
 * Dialog system.
 *
 * Everything here composes `components/ui/dialog` and
 * `components/ui/alert-dialog`. Nothing reimplements focus trapping, scroll
 * locking, or escape handling — those already work correctly in the primitives.
 *
 * The distinction that matters: a **confirmation** uses `alert-dialog`, which
 * is modal and has no dismiss-on-outside-click, because a destructive choice
 * should not be made by a stray click. Informational dialogs use `dialog`.
 */

export interface DialogFooterActionsProps {
  /** Label for the affirmative action. */
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  /** Disables both buttons and shows a spinner on the confirm action. */
  loading?: boolean;
  destructive?: boolean;
  /** Hides the cancel button, for acknowledge-only dialogs. */
  hideCancel?: boolean;
  className?: string;
}

/** The button row every dialog shares, so ordering never varies. */
export function DialogFooterActions({
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
  hideCancel = false,
  className,
}: DialogFooterActionsProps) {
  return (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}>
      {hideCancel ? null : (
        <AlertDialogCancel
          render={<Button variant="outline" disabled={loading} onClick={onCancel} />}
        >
          {cancelLabel}
        </AlertDialogCancel>
      )}

      <AlertDialogAction
        render={
          <Button
            variant={destructive ? "destructive" : "default"}
            className={destructive ? undefined : "bg-brand hover:bg-brand-hover"}
            disabled={loading}
            aria-busy={loading || undefined}
            // Not auto-closed: the caller decides, because an async confirm
            // must stay open while it runs and on failure.
            onClick={(event) => {
              if (loading) return;
              event.preventDefault();
              void onConfirm?.();
            }}
          />
        }
      >
        {loading ? <Spinner aria-hidden="true" /> : null}
        {confirmLabel}
      </AlertDialogAction>
    </div>
  );
}

/** Header block for a plain `Dialog`. Re-exported for symmetry with the footer. */
export function DialogHeaderBlock({
  title,
  description,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <UIDialogHeader className={className}>
      <DialogTitle>{title}</DialogTitle>
      {description ? <DialogDescription>{description}</DialogDescription> : null}
    </UIDialogHeader>
  );
}

type Tone = "brand" | "danger" | "success" | "warning" | "info";

const toneStyles: Record<Tone, string> = {
  brand: "bg-brand-subtle text-brand dark:text-brand-accent",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-success/12 text-success",
  warning: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
  info: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
};

export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  className?: string;
}

export interface ConfirmDialogProps extends BaseDialogProps {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
  /** Extra content between the description and the buttons. */
  children?: ReactNode;
}

/** The general "are you sure?" dialog. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
  destructive = false,
  icon: Icon,
  tone = destructive ? "danger" : "brand",
  children,
  className,
}: ConfirmDialogProps) {
  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          {Icon ? (
            <AlertDialogMedia className={toneStyles[tone]}>
              <Icon aria-hidden="true" />
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <DialogFooterActions
            confirmLabel={confirmLabel}
            cancelLabel={cancelLabel}
            onConfirm={onConfirm}
            loading={loading}
            destructive={destructive}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

export interface DeleteDialogProps extends BaseDialogProps {
  /** Name of the thing being deleted, quoted back to the user. */
  itemName?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmLabel?: string;
  /**
   * Requires the user to type `itemName` before the button enables.
   * Reserve it for genuinely irreversible, high-blast-radius deletions.
   */
  requireTypedConfirmation?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  loading = false,
  confirmLabel = "Delete",
  requireTypedConfirmation = false,
  className,
}: DeleteDialogProps) {
  const [typed, setTyped] = React.useState("");
  const confirmationId = React.useId();

  // Reset between openings, so a previous attempt does not pre-arm the button.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setTyped("");
  }

  const armed = !requireTypedConfirmation || typed.trim() === itemName;

  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogMedia className={toneStyles.danger}>
            <Trash2Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              (itemName
                ? `“${itemName}” will be permanently removed. This cannot be undone.`
                : "This cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireTypedConfirmation && itemName ? (
          <div className="space-y-2">
            <Label htmlFor={confirmationId}>
              Type <span className="font-semibold text-foreground">{itemName}</span> to
              confirm
            </Label>
            <Input
              id={confirmationId}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              className="h-10"
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel render={<Button variant="outline" disabled={loading} />}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={
                <Button
                  variant="destructive"
                  disabled={loading || !armed}
                  aria-busy={loading || undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!armed || loading) return;
                    void onConfirm();
                  }}
                />
              }
            >
              {loading ? <Spinner aria-hidden="true" /> : null}
              {confirmLabel}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

export interface MessageDialogProps extends BaseDialogProps {
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

/** Acknowledge-only notice. Use a toast unless it must interrupt. */
export function AppAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Got it",
  onAction,
  icon: Icon = TriangleAlertIcon,
  className,
}: MessageDialogProps) {
  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogMedia className={toneStyles.warning}>
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            render={
              <Button className="bg-brand hover:bg-brand-hover" onClick={onAction} />
            }
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Done",
  onAction,
  icon: Icon = CircleCheckIcon,
  className,
}: MessageDialogProps) {
  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogMedia className={toneStyles.success}>
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            render={
              <Button className="bg-brand hover:bg-brand-hover" onClick={onAction} />
            }
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

export interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
}

/**
 * Guards navigation away from a dirty form.
 *
 * "Keep editing" is the affirmative action and "Discard" is destructive, so the
 * safe choice is the one the user lands on by default.
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  saving = false,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={toneStyles.warning}>
            <InfoIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            Leaving now will discard everything you have changed on this page.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onDiscard} disabled={saving}>
              Discard changes
            </Button>
            {onSave ? (
              <Button
                variant="outline"
                onClick={() => void onSave()}
                disabled={saving}
                aria-busy={saving || undefined}
              >
                {saving ? <Spinner aria-hidden="true" /> : null}
                Save and leave
              </Button>
            ) : null}
            <AlertDialogCancel
              render={<Button className="bg-brand hover:bg-brand-hover" />}
            >
              Keep editing
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

/**
 * Blocking progress dialog.
 *
 * No close button and no dismiss handler: it is shown for work that must not be
 * interrupted, and is closed by the caller when that work finishes.
 */
export function LoadingDialog({
  open,
  title = "Working…",
  description,
}: {
  open: boolean;
  title?: string;
  description?: ReactNode;
}) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-xs">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <Spinner className="size-6 text-brand dark:text-brand-accent" aria-hidden="true" />
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Generic modal shell for custom content, e.g. a form. */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: BaseDialogProps & { children: ReactNode; footer?: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeaderBlock title={title} description={description} />
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
