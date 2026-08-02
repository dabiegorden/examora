"use client";

import type { ReactNode } from "react";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Search + filter row above a list.
 *
 * Presentational only in this phase: the input and selects are uncontrolled and
 * filter nothing. They are real form controls with real labels so that wiring
 * state in later is a change of behaviour, not of markup.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  placeholder: string;
  options: readonly FilterOption[];
  className?: string;
}

export interface DataToolbarProps {
  searchPlaceholder: string;
  /** Accessible name for the search box, since the label is visually hidden. */
  searchLabel: string;
  filters?: readonly FilterConfig[];
  /** Buttons aligned to the end of the row. */
  actions?: ReactNode;
  className?: string;
}

export function DataToolbar({
  searchPlaceholder,
  searchLabel,
  filters = [],
  actions,
  className,
}: DataToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="toolbar-search" className="sr-only">
            {searchLabel}
          </label>
          <Input
            id="toolbar-search"
            type="search"
            placeholder={searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>

        {filters.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <Select key={filter.id}>
                <SelectTrigger
                  aria-label={filter.label}
                  className={cn("h-9 w-full sm:w-[9.5rem]", filter.className)}
                >
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export interface PaginationBarProps {
  /** Index of the first row on this page, 1-based. */
  from: number;
  to: number;
  total: number;
  label: string;
  className?: string;
}

/**
 * Pagination footer.
 *
 * The controls are disabled because there is only ever one page of placeholder
 * data — showing enabled buttons that do nothing would be worse.
 */
export function PaginationBar({
  from,
  to,
  total,
  label,
  className,
}: PaginationBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row",
        className
      )}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {label}
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      </div>
    </div>
  );
}
