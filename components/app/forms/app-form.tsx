"use client";

import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlertIcon } from "lucide-react";

/**
 * Form foundation.
 *
 * Wires React Hook Form to the field components in this folder. The pieces that
 * matter and are easy to get wrong — associating a label, description, and
 * error message with an input via ids, and setting `aria-invalid` — happen once
 * here rather than being re-typed per field.
 *
 * Validation belongs to Zod schemas in `validators/`; nothing in this folder
 * defines validation rules.
 */

export interface AppFormProps<TValues extends FieldValues>
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  form: UseFormReturn<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  /** Form-level failure, shown above the fields. */
  error?: string | null;
  children: React.ReactNode;
}

export function AppForm<TValues extends FieldValues>({
  form,
  onSubmit,
  error,
  children,
  className,
  ...props
}: AppFormProps<TValues>) {
  return (
    <FormProvider {...form}>
      <form
        // `noValidate` hands validation to Zod: the browser's native bubbles
        // cannot be styled and would contradict the field-level messages.
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-5", className)}
        {...props}
      >
        {error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {children}
      </form>
    </FormProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Field context                               */
/* -------------------------------------------------------------------------- */

interface FieldContextValue {
  name: string;
  inputId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
  message?: string;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useAppField(): FieldContextValue {
  const context = React.useContext(FieldContext);
  if (!context) {
    throw new Error("useAppField must be used inside <AppField>.");
  }
  return context;
}

export interface AppFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> {
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Marks the control required and shows the indicator. */
  required?: boolean;
  className?: string;
  /**
   * Receives the RHF field bindings plus the ids and validity this field owns.
   * Spread `field` onto your control and `aria` onto it as well.
   */
  children: (args: {
    field: ControllerRenderProps<TValues, TName>;
    inputId: string;
    invalid: boolean;
    aria: {
      id: string;
      "aria-invalid": boolean | undefined;
      "aria-describedby": string | undefined;
      "aria-required": boolean | undefined;
    };
  }) => React.ReactNode;
  control?: Control<TValues>;
}

/**
 * A labelled, described, error-aware form row.
 *
 * `aria-describedby` points at the description and, when present, the error —
 * so a screen reader announces *why* a field is invalid rather than just that
 * it is.
 */
export function AppField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({
  name,
  label,
  description,
  required,
  className,
  children,
  control,
}: AppFieldProps<TValues, TName>) {
  const context = useFormContext<TValues>();
  const resolvedControl = control ?? context?.control;
  const { errors } = useFormState({ control: resolvedControl, name });

  const reactId = React.useId();
  const inputId = `${reactId}-${name}`;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  const error = name
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], errors);
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : undefined;
  const invalid = Boolean(message);

  const describedBy =
    [description ? descriptionId : null, invalid ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ name, inputId, descriptionId, errorId, invalid, message }}
    >
      <div className={cn("flex flex-col gap-2", className)}>
        {label ? (
          <Label htmlFor={inputId}>
            {label}
            {required ? (
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            ) : null}
          </Label>
        ) : null}

        <Controller
          name={name}
          control={resolvedControl}
          render={({ field }) =>
            children({
              field,
              inputId,
              invalid,
              aria: {
                id: inputId,
                "aria-invalid": invalid || undefined,
                "aria-describedby": describedBy,
                "aria-required": required || undefined,
              },
            }) as React.ReactElement
          }
        />

        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}

        <AppFieldError />
      </div>
    </FieldContext.Provider>
  );
}

/**
 * Standalone helper text.
 *
 * `AppField` renders its own `description` inline; this is for composing a
 * field by hand outside that component.
 */
export function AppFieldDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
}

/**
 * Validation message.
 *
 * `role="alert"` so it is announced the moment it appears, rather than only
 * when the user happens to focus the field again.
 */
export function AppFieldError({ className }: { className?: string }) {
  const { errorId, message } = useAppField();
  if (!message) return null;

  return (
    <p
      id={errorId}
      role="alert"
      className={cn("text-xs font-medium text-destructive", className)}
    >
      {message}
    </p>
  );
}

/** Submit/cancel row. Sticks to the end on desktop, stacks on mobile. */
export function AppFormActions({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "between";
}) {
  const alignment = {
    start: "sm:justify-start",
    end: "sm:justify-end",
    between: "sm:justify-between",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center",
        alignment[align],
        className
      )}
    >
      {children}
    </div>
  );
}
