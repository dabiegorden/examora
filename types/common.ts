/**
 * Transport-agnostic shapes shared by repositories, services, and (later)
 * server actions.
 */

/** Options accepted by every paginated repository method. */
export interface PaginationParams {
  /** 1-based page number. */
  page?: number;
  /** Rows per page. Clamped by `normalizePagination`. */
  pageSize?: number;
}

/** Resolved pagination, after defaults and clamping have been applied. */
export interface ResolvedPagination {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

/** A page of rows plus the metadata a table UI needs to render its pager. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortParams<TField extends string = string> {
  sortBy?: TField;
  sortDirection?: SortDirection;
}

/**
 * Explicit success/failure envelope for operations whose failure is expected
 * (validation, conflicts, not-found) rather than exceptional.
 *
 * Server actions return this so the UI can branch on `success` instead of
 * catching. Genuinely exceptional cases still throw — see `lib/errors.ts`.
 */
export type Result<TData, TError = string> =
  | { success: true; data: TData }
  | { success: false; error: TError };

export function ok<TData>(data: TData): Result<TData, never> {
  return { success: true, data };
}

export function err<TError>(error: TError): Result<never, TError> {
  return { success: false, error };
}

/** Field-keyed validation messages, as produced by `flattenZodError`. */
export type FieldErrors = Record<string, string[]>;

/** Standard failure payload for a server action. */
export interface ActionError {
  message: string;
  code?: string;
  fieldErrors?: FieldErrors;
}

export type ActionResult<TData> = Result<TData, ActionError>;
