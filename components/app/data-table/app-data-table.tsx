"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AppBulkActionBar,
  AppPagination,
  AppRowActions,
  AppTableError,
  AppTableLoading,
  AppTableSkeleton,
  SortableHeader,
} from "./parts";
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableRowAction,
  DataTableStatus,
  PaginationState,
  SortDirection,
  SortState,
} from "./types";

/**
 * The application data table.
 *
 * Generic over the row type and unaware of any domain. Sorting, selection, and
 * column visibility each work in two modes: leave the state prop undefined and
 * the table manages it internally, or pass state plus a handler and the caller
 * owns it (for URL-backed or server-side tables). That is what lets the same
 * component serve a static list and a paginated server query.
 *
 * Two responsive strategies work together: `hideBelow` drops less important
 * columns at their breakpoint, and whatever remains scrolls inside the wrapper
 * rather than widening the page.
 */

const alignClasses = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
} as const;

const hideClasses = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

export interface AppDataTableProps<TRow> {
  columns: ReadonlyArray<DataTableColumn<TRow>>;
  rows: readonly TRow[];
  /** Stable identity per row — used for keys and selection. */
  rowKey: (row: TRow) => string;

  /** Drives which body renders. `idle` shows the rows. */
  status?: DataTableStatus;
  /** Shown when `status` is `empty`. */
  empty?: React.ReactNode;
  onRetry?: () => void;
  errorReference?: string;

  /** Uncontrolled unless `sort` and `onSortChange` are both provided. */
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  defaultSort?: SortState;

  selectable?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  bulkActions?: ReadonlyArray<DataTableBulkAction<TRow>>;

  rowActions?: ReadonlyArray<DataTableRowAction<TRow>>;

  /**
   * Columns to hide. Owned by the page, because `AppColumnSelector` lives in
   * the toolbar the page composes — the table would otherwise have to reach
   * upward to render it.
   */
  hiddenColumns?: ReadonlySet<string>;

  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  paginationLabel?: string;

  /** Row click handler. Keep row actions out of the clickable area. */
  onRowClick?: (row: TRow) => void;
  /** Screen-reader description of the table's contents. */
  caption: string;
  className?: string;
  /** Skips client-side sorting — the caller already sorted the rows. */
  manualSorting?: boolean;
}

export function AppDataTable<TRow>({
  columns,
  rows,
  rowKey,
  status = "idle",
  empty,
  onRetry,
  errorReference,
  sort,
  onSortChange,
  defaultSort,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  bulkActions = [],
  rowActions = [],
  hiddenColumns,
  pagination,
  onPageChange,
  onPageSizeChange,
  paginationLabel = "rows",
  onRowClick,
  caption,
  className,
  manualSorting = false,
}: AppDataTableProps<TRow>) {
  /* ------------------------------- sort state ------------------------------ */

  const [internalSort, setInternalSort] = React.useState<SortState | undefined>(
    defaultSort
  );
  const activeSort = sort ?? internalSort;

  const handleSort = (columnId: string, direction: SortDirection) => {
    const next = { columnId, direction };
    if (onSortChange) onSortChange(next);
    else setInternalSort(next);
  };

  /* ---------------------------- selection state ---------------------------- */

  const [internalSelection, setInternalSelection] = React.useState<Set<string>>(
    new Set()
  );
  const selection = selectedKeys ?? internalSelection;

  const setSelection = (next: Set<string>) => {
    if (onSelectionChange) onSelectionChange(next);
    else setInternalSelection(next);
  };

  /* ------------------------- column visibility state ----------------------- */

  const defaultHidden = React.useMemo(
    () => new Set(columns.filter((column) => column.defaultHidden).map((c) => c.id)),
    [columns]
  );
  const hidden = hiddenColumns ?? defaultHidden;

  /* --------------------------------- rows ---------------------------------- */

  const visibleColumns = React.useMemo(
    () => columns.filter((column) => !hidden.has(column.id)),
    [columns, hidden]
  );

  const sortedRows = React.useMemo(() => {
    if (manualSorting || !activeSort) return rows;

    const column = columns.find((c) => c.id === activeSort.columnId);
    if (!column?.compare) return rows;

    const factor = activeSort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => column.compare!(a, b) * factor);
  }, [rows, columns, activeSort, manualSorting]);

  const selectedRows = React.useMemo(
    () => sortedRows.filter((row) => selection.has(rowKey(row))),
    [sortedRows, selection, rowKey]
  );

  const allSelected = sortedRows.length > 0 && selectedRows.length === sortedRows.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelection(allSelected ? new Set() : new Set(sortedRows.map(rowKey)));
  };

  const toggleRow = (key: string) => {
    const next = new Set(selection);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelection(next);
  };

  /* -------------------------------- states --------------------------------- */

  if (status === "loading") {
    return <AppTableSkeleton rows={6} columns={Math.min(visibleColumns.length, 5)} />;
  }

  if (status === "error") {
    return <AppTableError onRetry={onRetry} reference={errorReference} />;
  }

  if (status === "empty" || rows.length === 0) {
    return <>{empty ?? <AppTableLoading label="No rows to display" />}</>;
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {selectable && bulkActions.length > 0 ? (
        <AppBulkActionBar
          selectedRows={selectedRows}
          actions={bulkActions}
          onClear={() => setSelection(new Set())}
        />
      ) : null}

      <div className="w-full min-w-0 overflow-x-auto">
        <Table>
          <caption className="sr-only">{caption}</caption>

          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected || undefined}
                    onCheckedChange={toggleAll}
                    aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
                  />
                </TableHead>
              ) : null}

              {visibleColumns.map((column) => {
                const classes = cn(
                  column.align && alignClasses[column.align],
                  column.hideBelow && hideClasses[column.hideBelow],
                  column.className
                );

                if (column.sortable) {
                  return (
                    <SortableHeader
                      key={column.id}
                      column={column as DataTableColumn<unknown>}
                      sort={activeSort}
                      onSort={handleSort}
                      className={classes}
                    >
                      {column.header}
                    </SortableHeader>
                  );
                }

                return (
                  <TableHead key={column.id} className={classes} style={{ width: column.width }}>
                    {column.header}
                  </TableHead>
                );
              })}

              {rowActions.length > 0 ? (
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedRows.map((row) => {
              const key = rowKey(row);
              const isSelected = selection.has(key);

              return (
                <TableRow
                  key={key}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    isSelected && "bg-brand-subtle/40",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selectable ? (
                    // Stops a selection click from also firing `onRowClick`.
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(key)}
                        aria-label={`Select row ${key}`}
                      />
                    </TableCell>
                  ) : null}

                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.align && alignClasses[column.align],
                        column.hideBelow && hideClasses[column.hideBelow],
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}

                  {rowActions.length > 0 ? (
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <AppRowActions row={row} actions={rowActions} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <AppPagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          label={paginationLabel}
        />
      ) : null}
    </div>
  );
}
