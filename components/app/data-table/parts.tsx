"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TableHead } from "@/components/ui/table";
import { EmptyState, NoData, NoSearchResults } from "@/components/app/feedback/empty-state";
import { ErrorPanel } from "@/components/app/feedback/error-state";
import { TableSkeleton } from "@/components/app/feedback/skeletons";
import type {
  DataTableColumn,
  DataTableBulkAction,
  DataTableRowAction,
  PaginationState,
  SortDirection,
  SortState,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                   Toolbar                                  */
/* -------------------------------------------------------------------------- */

export interface AppDataToolbarProps {
  /** Search input, typically `SearchBar` from `components/app/filters`. */
  search?: React.ReactNode;
  /** Facet controls. */
  filters?: React.ReactNode;
  /** Buttons aligned to the end — create, export, column selector. */
  actions?: React.ReactNode;
  /** Applied-filter chips on their own row. */
  chips?: React.ReactNode;
  className?: string;
}

export function AppDataToolbar({
  search,
  filters,
  actions,
  chips,
  className,
}: AppDataToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {search}
          {filters ? (
            // Scrolls rather than wrapping, so a row of facets never pushes the
            // table below the fold on a phone.
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              {filters}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>

      {chips ? <div className="flex flex-wrap items-center gap-1.5">{chips}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Sortable header                              */
/* -------------------------------------------------------------------------- */

export function SortableHeader({
  column,
  sort,
  onSort,
  className,
  children,
}: {
  column: DataTableColumn<unknown>;
  sort?: SortState;
  onSort?: (columnId: string, direction: SortDirection) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const active = sort?.columnId === column.id;
  const direction: SortDirection = active && sort?.direction === "asc" ? "asc" : "desc";
  const next: SortDirection = active && sort?.direction === "asc" ? "desc" : "asc";

  const Icon = !active ? ArrowUpDownIcon : direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <TableHead
      // `aria-sort` is what tells a screen reader the table is sorted and how.
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort?.(column.id, next)}
        className="-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-1 font-medium transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
        <Icon
          aria-hidden="true"
          className={cn("size-3.5", active ? "text-foreground" : "text-muted-foreground/60")}
        />
        <span className="sr-only">
          {active
            ? `sorted ${direction === "asc" ? "ascending" : "descending"}, activate to sort ${next === "asc" ? "ascending" : "descending"}`
            : "activate to sort"}
        </span>
      </button>
    </TableHead>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Column visibility                             */
/* -------------------------------------------------------------------------- */

export function AppColumnSelector<TRow>({
  columns,
  hidden,
  onChange,
  className,
}: {
  columns: ReadonlyArray<DataTableColumn<TRow>>;
  hidden: ReadonlySet<string>;
  onChange: (hidden: Set<string>) => void;
  className?: string;
}) {
  const toggleable = columns.filter((column) => !column.locked);

  const toggle = (id: string) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className={cn("h-9", className)} />
        }
      >
        <SettingsIcon aria-hidden="true" />
        <span className="hidden sm:inline">Columns</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-(--anchor-width) min-w-48">
        {toggleable.map((column) => {
          const visible = !hidden.has(column.id);
          const label = column.headerLabel ?? column.id;

          return (
            <DropdownMenuItem
              key={column.id}
              closeOnClick={false}
              onClick={() => toggle(column.id)}
              render={<button type="button" className="w-full" />}
              nativeButton
            >
              <Checkbox checked={visible} aria-hidden="true" tabIndex={-1} className="pointer-events-none" />
              <span className="flex-1 text-left capitalize">{label}</span>
              <span className="sr-only">
                {visible ? "visible, activate to hide" : "hidden, activate to show"}
              </span>
            </DropdownMenuItem>
          );
        })}

        {hidden.size > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onChange(new Set())}
              render={<button type="button" className="w-full" />}
              nativeButton
            >
              Show all columns
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Row actions                                */
/* -------------------------------------------------------------------------- */

export function AppRowActions<TRow>({
  row,
  actions,
  label = "Row actions",
  className,
}: {
  row: TRow;
  actions: ReadonlyArray<DataTableRowAction<TRow>>;
  label?: string;
  className?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn("ml-auto", className)}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-(--anchor-width) min-w-44">
        {actions.map((action) => (
          <React.Fragment key={action.id}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant={action.destructive ? "destructive" : "default"}
              disabled={action.disabled?.(row)}
              onClick={() => action.onSelect(row)}
            >
              {action.icon ? <action.icon aria-hidden="true" /> : null}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Bulk action bar                              */
/* -------------------------------------------------------------------------- */

/**
 * Appears when rows are selected.
 *
 * `role="status"` announces the selection count as it changes, so a keyboard
 * user knows the bar exists without seeing it slide in.
 */
export function AppBulkActionBar<TRow>({
  selectedRows,
  actions,
  onClear,
  className,
}: {
  selectedRows: TRow[];
  actions: ReadonlyArray<DataTableBulkAction<TRow>>;
  onClear: () => void;
  className?: string;
}) {
  if (selectedRows.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border bg-brand-subtle/60 px-4 py-2.5",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground tabular-nums">
        {selectedRows.length} selected
      </span>

      <Separator orientation="vertical" className="mx-1 hidden data-vertical:h-4 sm:block" />

      <div className="flex flex-wrap items-center gap-1.5">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.destructive ? "destructive" : "outline"}
            size="sm"
            onClick={() => action.onSelect(selectedRows)}
          >
            {action.icon ? <action.icon aria-hidden="true" /> : null}
            {action.label}
          </Button>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <XIcon aria-hidden="true" />
        Clear
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Pagination                                 */
/* -------------------------------------------------------------------------- */

const PAGE_SIZES = [10, 20, 50, 100] as const;

export function AppPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  label = "rows",
  className,
}: {
  pagination: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  label?: string;
  className?: string;
}) {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row",
        className
      )}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground tabular-nums">{from}</span>–
        <span className="font-medium text-foreground tabular-nums">{to}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span> {label}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange ? (
          <div className="hidden items-center gap-2 sm:flex">
            <label htmlFor="page-size" className="text-xs text-muted-foreground">
              Per page
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Table states                                */
/* -------------------------------------------------------------------------- */

export function AppTableSkeleton({
  rows = 6,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return <TableSkeleton rows={rows} columns={columns} toolbar={false} />;
}

/** Inline spinner for a refresh that keeps the current rows on screen. */
export function AppTableLoading({ label = "Loading rows" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-muted-foreground"
    >
      <Spinner aria-hidden="true" />
      {label}
    </div>
  );
}

export function AppTableEmpty({
  searchQuery,
  onResetFilters,
  ...props
}: React.ComponentProps<typeof NoData> & {
  /** Switches to the "no results" message, which needs a different action. */
  searchQuery?: string;
  onResetFilters?: React.ReactNode;
}) {
  if (searchQuery || onResetFilters) {
    return <NoSearchResults query={searchQuery} onReset={onResetFilters} />;
  }

  return <NoData {...props} />;
}

export function AppTableError({
  onRetry,
  reference,
  details,
}: {
  onRetry?: () => void;
  reference?: string;
  details?: string;
}) {
  return (
    <ErrorPanel
      title="Could not load this table"
      description="The rows failed to load. This is usually temporary."
      onRetry={onRetry}
      reference={reference}
      details={details}
    />
  );
}

export { EmptyState };
