import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<TRow> {
  /** Stable key, also used as the React key for cells. */
  id: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  /** Tailwind classes for both the header cell and the body cells. */
  className?: string;
  /** Hides the column below a breakpoint instead of letting the table overflow. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  align?: "start" | "end";
}

export interface DashboardTableProps<TRow> {
  columns: ReadonlyArray<Column<TRow>>;
  rows: readonly TRow[];
  rowKey: (row: TRow) => string;
  /** Rendered in place of the table when there are no rows. */
  empty?: ReactNode;
  caption?: string;
  className?: string;
}

const hideClasses = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

/**
 * The one table on the dashboard.
 *
 * Column definitions are data, so every list page gets identical spacing,
 * alignment, and responsive behaviour without copying markup.
 *
 * Two responsive strategies work together: less important columns drop out at
 * their breakpoint via `hideBelow`, and whatever remains scrolls horizontally
 * inside the wrapper rather than pushing the page wide. At 320px a table still
 * shows its first two columns without the layout breaking.
 */
export function DashboardTable<TRow>({
  columns,
  rows,
  rowKey,
  empty,
  caption,
  className,
}: DashboardTableProps<TRow>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}

        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  column.align === "end" && "text-right",
                  column.hideBelow && hideClasses[column.hideBelow],
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={cn(
                    column.align === "end" && "text-right",
                    column.hideBelow && hideClasses[column.hideBelow],
                    column.className
                  )}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
