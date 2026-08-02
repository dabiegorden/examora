import type { ReactNode } from "react";

/**
 * Data table contracts.
 *
 * Generic over the row type and free of any domain knowledge: a column knows
 * how to render a cell and, optionally, how to sort — nothing about courses,
 * students, or exams.
 */

export type SortDirection = "asc" | "desc";

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableColumn<TRow> {
  /** Stable identifier — used as the React key and in sort/visibility state. */
  id: string;
  header: ReactNode;
  /** Plain-text header, for the column-visibility menu and screen readers. */
  headerLabel?: string;
  cell: (row: TRow) => ReactNode;

  /** Enables the sort control on this column's header. */
  sortable?: boolean;
  /**
   * Comparator for client-side sorting. Omit when sorting happens server-side —
   * the table then just reports the requested sort upward.
   */
  compare?: (a: TRow, b: TRow) => number;

  align?: "start" | "end" | "center";
  /** Hides the column below this breakpoint instead of overflowing the page. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  /** Excluded from the column-visibility menu — e.g. selection or actions. */
  locked?: boolean;
  /** Hidden by default until the user enables it. */
  defaultHidden?: boolean;
  className?: string;
  width?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableBulkAction<TRow> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: (rows: TRow[]) => void;
  destructive?: boolean;
}

export interface DataTableRowAction<TRow> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: (row: TRow) => void;
  destructive?: boolean;
  disabled?: (row: TRow) => boolean;
  /** Starts a new group in the menu. */
  separatorBefore?: boolean;
}

/** What the table is currently doing. Drives which body it renders. */
export type DataTableStatus = "idle" | "loading" | "error" | "empty";
