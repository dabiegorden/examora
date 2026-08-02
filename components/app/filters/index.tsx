"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarIcon, CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CountBadge } from "@/components/app/feedback/status-badge";

/**
 * Filter controls.
 *
 * Each component owns its presentation and reports changes upward; none of them
 * hold the filter state or touch the URL. Where that state lives — `useState`,
 * search params, a store — is the page's decision, and baking it in here would
 * make these unusable in half the places they are needed.
 */

export interface SearchBarProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
  /** Accessible name; the visible label is hidden to keep toolbars compact. */
  label?: string;
  onClear?: () => void;
  /** Debounce in ms before `onDebouncedChange` fires. */
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
}

/**
 * Search input with a clear button.
 *
 * `type="search"` plus an explicit clear control: the browser's native clear
 * affordance is inconsistent across engines and invisible to keyboard users in
 * some of them.
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  label = "Search",
  placeholder = "Search…",
  className,
  debounceMs = 0,
  onDebouncedChange,
  id,
  ...props
}: SearchBarProps) {
  const reactId = React.useId();
  const inputId = id ?? reactId;
  const [internal, setInternal] = React.useState(value ?? "");

  // Mirror a controlled value without an effect.
  const [lastValue, setLastValue] = React.useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setInternal(value ?? "");
  }

  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (next: string) => {
    setInternal(next);
    onChange?.(next);

    if (!onDebouncedChange) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onDebouncedChange(next), debounceMs);
  };

  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={inputId}
        type="search"
        value={internal}
        placeholder={placeholder}
        onChange={(event) => handleChange(event.target.value)}
        className="h-9 pr-9 pl-9"
        {...props}
      />
      {internal.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            handleChange("");
            onClear?.();
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface FilterDropdownProps {
  label: string;
  options: readonly FilterOption[];
  /** Selected values. Single-select passes an array of length 0 or 1. */
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Faceted filter, in the shape Linear and GitHub use.
 *
 * The trigger shows the current selection rather than just the facet name, so a
 * filtered view never looks unfiltered.
 */
export function FilterDropdown({
  label,
  options,
  value = [],
  onChange,
  multiple = true,
  icon: Icon,
  className,
}: FilterDropdownProps) {
  const selected = new Set(value);

  const toggle = (option: string) => {
    if (!multiple) {
      onChange?.(selected.has(option) ? [] : [option]);
      return;
    }

    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange?.([...next]);
  };

  const summary =
    value.length === 0
      ? null
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} selected`;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9 border-dashed font-normal", className)}
          />
        }
      >
        {Icon ? <Icon aria-hidden="true" /> : null}
        {label}
        {summary ? (
          <>
            <Separator orientation="vertical" className="mx-1 data-vertical:h-4" />
            <span className="font-medium text-foreground">{summary}</span>
          </>
        ) : null}
        <ChevronDownIcon aria-hidden="true" className="opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 p-1">
        <ul role="listbox" aria-multiselectable={multiple} aria-label={label}>
          {options.map((option) => {
            const isSelected = selected.has(option.value);

            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:bg-accent"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      isSelected ? "border-brand bg-brand text-white" : "border-border"
                    )}
                  >
                    {isSelected ? <CheckIcon className="size-3" /> : null}
                  </span>

                  {option.icon ? (
                    <option.icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  ) : null}

                  <span className="flex-1 truncate">{option.label}</span>

                  {option.count !== undefined ? (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {option.count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {value.length > 0 ? (
          <>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange?.([])}
            >
              Clear
            </Button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/** Preset facets. Options are passed in, so nothing here is domain-coupled. */
export function StatusFilter(props: Omit<FilterDropdownProps, "label">) {
  return <FilterDropdown label="Status" {...props} />;
}

export function RoleFilter(props: Omit<FilterDropdownProps, "label">) {
  return <FilterDropdown label="Role" {...props} />;
}

export function CourseFilter(props: Omit<FilterDropdownProps, "label">) {
  return <FilterDropdown label="Course" {...props} />;
}

export interface DateRangeFilterProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  label?: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  label = "Date range",
  className,
}: DateRangeFilterProps) {
  const summary = value?.from
    ? value.to
      ? `${format(value.from, "d MMM")} – ${format(value.to, "d MMM")}`
      : format(value.from, "d MMM yyyy")
    : null;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={label}
            className={cn("h-9 border-dashed font-normal", className)}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {label}
        {summary ? (
          <>
            <Separator orientation="vertical" className="mx-1 data-vertical:h-4" />
            <span className="font-medium text-foreground">{summary}</span>
          </>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={1}
          autoFocus
          className="sm:hidden"
        />
        {/* Two months side by side where there is room to show them. */}
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          className="hidden sm:block"
        />

        {value?.from ? (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange?.(undefined)}
            >
              Clear dates
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove?: () => void;
  className?: string;
}

/** A single applied filter, removable. */
export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <Badge variant="secondary" className={cn("h-7 gap-1 pr-1 font-normal", className)}>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="rounded-full p-0.5 transition-colors outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <XIcon className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </Badge>
  );
}

export function ResetFiltersButton({
  onReset,
  count,
  className,
}: {
  onReset: () => void;
  /** Number of active filters, shown so the button explains what it clears. */
  count?: number;
  className?: string;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onReset} className={cn("h-9", className)}>
      <XIcon aria-hidden="true" />
      Reset
      {count !== undefined && count > 0 ? <CountBadge count={count} /> : null}
    </Button>
  );
}

export interface FilterGroupProps {
  children: React.ReactNode;
  /** Applied-filter chips, rendered on their own row beneath the controls. */
  chips?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Container for a filter toolbar.
 *
 * The control row scrolls horizontally on narrow screens rather than wrapping
 * into a tall stack that pushes the table off the fold.
 */
export function FilterGroup({ children, chips, actions, className }: FilterGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
          {children}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {chips ? <div className="flex flex-wrap items-center gap-1.5">{chips}</div> : null}
    </div>
  );
}
