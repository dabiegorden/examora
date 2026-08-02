"use client";

import * as React from "react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ComingSoonBadge } from "@/components/app/feedback/status-badge";

/**
 * Form controls.
 *
 * Every control here is uncontrolled-agnostic: it takes `value`/`onChange` in
 * the shape React Hook Form's `field` already provides, so the usual call is
 * `<AppInput {...field} {...aria} />` with no adapter in between.
 *
 * None of these restyle a native element from scratch — they compose the
 * primitives in `components/ui`, which is where focus rings, disabled states,
 * and invalid styling already live.
 */

const CONTROL_HEIGHT = "h-10";

export interface AppInputProps
  // `prefix`/`suffix` exist as native HTML attributes typed `string`. They are
  // omitted so these can carry renderable adornments instead.
  extends Omit<React.ComponentProps<typeof Input>, "prefix" | "suffix"> {
  /** Leading adornment, e.g. a currency symbol or icon. */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function AppInput({ className, prefix, suffix, ...props }: AppInputProps) {
  if (!prefix && !suffix) {
    return <Input className={cn(CONTROL_HEIGHT, className)} {...props} />;
  }

  return (
    <div className="relative flex items-center">
      {prefix ? (
        <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground">
          {prefix}
        </span>
      ) : null}

      <Input
        className={cn(CONTROL_HEIGHT, prefix && "pl-9", suffix && "pr-9", className)}
        {...props}
      />

      {suffix ? (
        <span className="pointer-events-none absolute right-3 text-sm text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function AppEmailInput({ className, ...props }: AppInputProps) {
  return (
    <AppInput
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      spellCheck={false}
      placeholder="name@school.edu"
      className={className}
      {...props}
    />
  );
}

export interface AppPasswordInputProps
  extends Omit<AppInputProps, "prefix" | "suffix" | "type"> {
  /** Set on sign-in forms so browsers do not offer to generate a password. */
  currentPassword?: boolean;
}

/**
 * Password field with a reveal toggle.
 *
 * The toggle is a real button with an accessible name that reflects state, so
 * it is reachable by keyboard and announced correctly — not a bare icon.
 */
export function AppPasswordInput({
  className,
  currentPassword = false,
  ...props
}: AppPasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative flex items-center">
      <Input
        type={visible ? "text" : "password"}
        autoComplete={currentPassword ? "current-password" : "new-password"}
        className={cn(CONTROL_HEIGHT, "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {visible ? (
          <EyeOffIcon className="size-4" aria-hidden="true" />
        ) : (
          <EyeIcon className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export interface AppNumberInputProps
  extends Omit<
    AppInputProps,
    "value" | "onChange" | "type" | "prefix" | "suffix"
  > {
  value?: number | "";
  onChange?: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Numeric input.
 *
 * Emits a `number` (or `""` when cleared) rather than the raw string, so a Zod
 * schema receives the type it expects without a `z.coerce` at every call site.
 */
export function AppNumberInput({
  value,
  onChange,
  className,
  ...props
}: AppNumberInputProps) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(event) => {
        const raw = event.target.value;
        onChange?.(raw === "" ? "" : Number(raw));
      }}
      className={cn(CONTROL_HEIGHT, "tabular-nums", className)}
      {...props}
    />
  );
}

/**
 * Phone input.
 *
 * `type="tel"` for the numeric keypad on mobile, but no format masking: numbers
 * vary by country and a mask that assumes one shape locks out everyone else.
 */
export function AppPhoneInput({ className, ...props }: AppInputProps) {
  return (
    <AppInput
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+233 20 000 0000"
      className={className}
      {...props}
    />
  );
}

export function AppTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return <Textarea className={cn("min-h-24 resize-y", className)} {...props} />;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  "aria-label"?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  ...aria
}: AppSelectProps) {
  return (
    <Select
      value={value ?? null}
      onValueChange={(next: unknown) => onChange?.(String(next ?? ""))}
      disabled={disabled}
    >
      <SelectTrigger className={cn(CONTROL_HEIGHT, "w-full", className)} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface AppMultiSelectProps {
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/**
 * Multi-select built on a popover checklist.
 *
 * Selections are also rendered as removable chips beneath the trigger: reading
 * "3 selected" tells a user how many, not which, and reopening a menu to find
 * out is friction.
 */
export function AppMultiSelect({
  value = [],
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  ...aria
}: AppMultiSelectProps) {
  const selected = new Set(value);

  const toggle = (option: string) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange?.([...next]);
  };

  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  return (
    <div className={cn("space-y-2", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              disabled={disabled}
              aria-haspopup="dialog"
              className={cn(CONTROL_HEIGHT, "w-full justify-between font-normal")}
              {...aria}
            />
          }
        >
          <span className={cn(value.length === 0 && "text-muted-foreground")}>
            {value.length === 0
              ? placeholder
              : `${value.length} selected`}
          </span>
          <ChevronDownIcon aria-hidden="true" className="ml-auto opacity-60" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-(--anchor-width) min-w-56 p-1">
          <ul role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.has(option.value);

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => toggle(option.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-brand bg-brand text-white"
                          : "border-border"
                      )}
                    >
                      {isSelected ? <CheckIcon className="size-3" /> : null}
                    </span>
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={v}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {labelFor(v)}
                <button
                  type="button"
                  onClick={() => toggle(v)}
                  aria-label={`Remove ${labelFor(v)}`}
                  className="rounded-full p-0.5 transition-colors outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export interface AppCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Checkbox with its label and description wired to it. */
export function AppCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  className,
}: AppCheckboxProps) {
  const reactId = React.useId();
  const controlId = id ?? reactId;
  const descriptionId = `${controlId}-description`;

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <Checkbox
        id={controlId}
        checked={checked}
        onCheckedChange={(next: boolean) => onChange?.(next)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        className="mt-0.5"
      />
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={controlId} className="font-normal">
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface AppSwitchProps extends Omit<AppCheckboxProps, "onChange"> {
  onChange?: (checked: boolean) => void;
}

/** Switch row: label on the left, control on the right. */
export function AppSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  className,
}: AppSwitchProps) {
  const reactId = React.useId();
  const controlId = id ?? reactId;
  const descriptionId = `${controlId}-description`;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={controlId}>{label}</Label>
        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        id={controlId}
        checked={checked}
        onCheckedChange={(next: boolean) => onChange?.(next)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
      />
    </div>
  );
}

export interface AppRadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  options: ReadonlyArray<SelectOption & { description?: string }>;
  /** Names the group for assistive tech; required, as radios are meaningless alone. */
  label: string;
  disabled?: boolean;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function AppRadioGroup({
  value,
  onChange,
  options,
  label,
  disabled,
  className,
  orientation = "vertical",
}: AppRadioGroupProps) {
  const groupId = React.useId();

  return (
    <RadioGroup
      value={value ?? null}
      onValueChange={(next: unknown) => onChange?.(String(next ?? ""))}
      disabled={disabled}
      aria-label={label}
      className={cn(
        orientation === "horizontal" ? "flex flex-wrap gap-4" : "flex flex-col gap-3",
        className
      )}
    >
      {options.map((option) => {
        const itemId = `${groupId}-${option.value}`;

        return (
          <div key={option.value} className="flex items-start gap-2.5">
            <RadioGroupItem
              id={itemId}
              value={option.value}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <div className="min-w-0 space-y-0.5">
              <Label htmlFor={itemId} className="font-normal">
                {option.label}
              </Label>
              {option.description ? (
                <p className="text-xs text-muted-foreground">{option.description}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}

export interface AppDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/** Date field: a button showing the formatted value, opening a calendar. */
export function AppDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  ...aria
}: AppDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              CONTROL_HEIGHT,
              "w-full justify-start font-normal",
              !value && "text-muted-foreground",
              className
            )}
            {...aria}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {value ? format(value, "d MMM yyyy") : placeholder}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * File upload placeholder.
 *
 * Deliberately inert: uploads are explicitly out of scope for this phase. The
 * drop zone exists so import screens can be laid out now, and it is marked
 * `aria-disabled` rather than pretending to accept files.
 */
export function AppFileUploadPlaceholder({
  label = "Upload a file",
  hint = "CSV or Excel, up to 5 MB",
  className,
}: {
  label?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      aria-disabled="true"
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-subtle text-brand dark:text-brand-accent">
        <UploadCloudIcon className="size-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <ComingSoonBadge />
    </div>
  );
}
