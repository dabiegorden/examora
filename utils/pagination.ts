import { PAGINATION } from "@/constants/app";
import type { Paginated, PaginationParams, ResolvedPagination } from "@/types/common";

/**
 * Apply defaults and clamp user-supplied paging.
 *
 * Clamping matters: `pageSize` usually arrives from a query string, and an
 * unbounded value is a trivial way to ask the database for the whole table.
 */
export function normalizePagination(params: PaginationParams = {}): ResolvedPagination {
  const page = Math.max(
    PAGINATION.DEFAULT_PAGE,
    Math.floor(params.page ?? PAGINATION.DEFAULT_PAGE)
  );

  const pageSize = Math.min(
    PAGINATION.MAX_PAGE_SIZE,
    Math.max(
      PAGINATION.MIN_PAGE_SIZE,
      Math.floor(params.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE)
    )
  );

  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
}

/** Wrap a page of rows with the metadata a table UI needs. */
export function buildPaginated<T>(
  items: T[],
  total: number,
  pagination: ResolvedPagination
): Paginated<T> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

  return {
    items,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}
