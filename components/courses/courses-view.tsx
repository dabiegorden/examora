"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BookOpenIcon,
  CalendarRangeIcon,
  CircleDotIcon,
  ArrowDownUpIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PrimaryButton } from "@/components/app/actions";
import { ConfirmDialog, DeleteDialog } from "@/components/app/dialogs";
import {
  AppColumnSelector,
  AppDataTable,
  AppDataToolbar,
  type DataTableColumn,
  type DataTableRowAction,
  type SortState,
} from "@/components/app/data-table";
import {
  FilterChip,
  FilterDropdown,
  ResetFiltersButton,
  SearchBar,
} from "@/components/app/filters";
import {
  NoCourses,
  NoSearchResults,
  StatusBadge,
  notify,
} from "@/components/app/feedback";
import {
  archiveCourse,
  createCourse,
  deleteCourse,
  restoreCourse,
  updateCourse,
} from "@/actions/course.actions";
import type { CourseStatusCounts, CourseWithCounts } from "@/repositories";
import type { ActionResult, Paginated } from "@/types/common";
import type {
  CourseFormValues,
  CourseSortField,
  CourseStatusFilter,
  ListCoursesInput,
} from "@/validators/course";
import { CourseFormDialog } from "./course-form-dialog";

/**
 * The course list.
 *
 * Filtering, sorting, and paging live in the URL rather than in component
 * state: a filtered list is then linkable, survives a reload, and comes back
 * intact from the browser's back button. Each change is a `replace` inside a
 * transition, so the server re-queries without pushing a history entry per
 * keystroke and the current rows stay on screen while it does.
 *
 * Mutations run through `runMutation`, which applies an optimistic patch and
 * awaits the server action inside one transition. Keeping both in the same
 * transition is what makes the optimistic row survive until the real data
 * arrives instead of flashing back for a frame.
 */

/* -------------------------------------------------------------------------- */
/*                                 Formatting                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fixed to UTC on purpose.
 *
 * This component is server-rendered and then hydrated. Formatting in the local
 * zone would let a server in one zone and a browser in another disagree on the
 * date, which React reports as a hydration error.
 */
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/* -------------------------------------------------------------------------- */
/*                              Sorting presets                               */
/* -------------------------------------------------------------------------- */

interface SortPreset {
  value: string;
  label: string;
  sortBy: CourseSortField;
  sortDirection: "asc" | "desc";
}

const SORT_PRESETS: readonly SortPreset[] = [
  { value: "newest", label: "Newest first", sortBy: "createdAt", sortDirection: "desc" },
  { value: "oldest", label: "Oldest first", sortBy: "createdAt", sortDirection: "asc" },
  { value: "title-asc", label: "Name A–Z", sortBy: "title", sortDirection: "asc" },
  { value: "title-desc", label: "Name Z–A", sortBy: "title", sortDirection: "desc" },
  {
    value: "students",
    label: "Most students",
    sortBy: "studentCount",
    sortDirection: "desc",
  },
  { value: "exams", label: "Most exams", sortBy: "examCount", sortDirection: "desc" },
];

function presetFor(sortBy: CourseSortField, sortDirection: string): SortPreset {
  return (
    SORT_PRESETS.find(
      (preset) => preset.sortBy === sortBy && preset.sortDirection === sortDirection
    ) ?? SORT_PRESETS[0]
  );
}

const STATUS_LABELS: Record<CourseStatusFilter, string> = {
  active: "Active",
  archived: "Archived",
  all: "All courses",
};

/* -------------------------------------------------------------------------- */
/*                             Optimistic reducer                             */
/* -------------------------------------------------------------------------- */

type CourseMutation =
  | { type: "patch"; id: string; patch: Partial<CourseWithCounts> }
  | { type: "remove"; id: string };

function applyMutation(
  rows: readonly CourseWithCounts[],
  mutation: CourseMutation
): CourseWithCounts[] {
  if (mutation.type === "remove") {
    return rows.filter((row) => row.id !== mutation.id);
  }

  return rows.map((row) =>
    row.id === mutation.id ? { ...row, ...mutation.patch } : row
  );
}

/* -------------------------------------------------------------------------- */
/*                                    View                                    */
/* -------------------------------------------------------------------------- */

export interface CoursesViewProps {
  page: Paginated<CourseWithCounts>;
  query: ListCoursesInput;
  academicYears: readonly string[];
  counts: CourseStatusCounts;
}

export function CoursesView({ page, query, academicYears, counts }: CoursesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [rows, applyOptimistic] = React.useOptimistic(page.items, applyMutation);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CourseWithCounts | null>(null);
  const [archiving, setArchiving] = React.useState<CourseWithCounts | null>(null);
  const [deleting, setDeleting] = React.useState<CourseWithCounts | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set());

  // The search box is driven by local state rather than by the URL. Mirroring
  // the URL back into the input would let a debounced navigation land mid-word
  // and overwrite the characters typed since.
  const [searchText, setSearchText] = React.useState(query.search ?? "");

  /* ------------------------------- URL state ------------------------------- */

  const updateQuery = React.useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }

      // Any change to what is being listed invalidates the current page number.
      if (!("page" in patch)) params.delete("page");

      const queryString = params.toString();

      startTransition(() => {
        // `replace` and `scroll: false`: typing in the search box should not
        // fill the back stack, nor jump the table out from under the cursor.
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams]
  );

  const filtersApplied =
    Boolean(query.search) || query.status !== "active" || Boolean(query.academicYear);

  const activeFilterCount =
    (query.search ? 1 : 0) +
    (query.status !== "active" ? 1 : 0) +
    (query.academicYear ? 1 : 0);

  const resetFilters = () => {
    setSearchText("");
    updateQuery({ search: undefined, status: undefined, academicYear: undefined });
  };

  /* ------------------------------- mutations ------------------------------- */

  /**
   * Apply an optimistic change and run the server action in one transition.
   *
   * Returns the action's result so a caller with a form — the edit dialog — can
   * show a field error instead of only a toast.
   */
  const runMutation = React.useCallback(
    <TData,>(
      mutation: CourseMutation | null,
      action: () => Promise<ActionResult<TData>>,
      messages: {
        success: string;
        error: string;
        description?: (data: TData) => string;
      }
    ): Promise<ActionResult<TData>> =>
      new Promise((resolve) => {
        startTransition(async () => {
          if (mutation) applyOptimistic(mutation);

          const result = await action();

          if (result.success) {
            notify.success(messages.success, {
              description: messages.description?.(result.data),
            });
          } else if (result.error.code !== "VALIDATION") {
            // Field-level failures are rendered by the form that caused them; a
            // toast as well would say the same thing twice.
            notify.error(messages.error, { description: result.error.message });
          }

          resolve(result);
        });
      }),
    [applyOptimistic]
  );

  const handleCreate = (values: CourseFormValues) =>
    runMutation(null, () => createCourse(values), {
      success: "Course created",
      error: "Could not create course",
      description: (course) => `${course.code} · ${course.title}`,
    });

  const handleUpdate = (courseId: string, values: CourseFormValues) =>
    runMutation(
      {
        type: "patch",
        id: courseId,
        patch: {
          title: values.title,
          code: values.code,
          description: values.description || null,
          academicYear: values.academicYear || null,
        },
      },
      () => updateCourse(courseId, values),
      {
        success: "Course updated",
        error: "Could not update course",
        description: (course) => course.title,
      }
    );

  const handleArchive = (course: CourseWithCounts) => {
    setBusy(true);

    void runMutation(
      // Archiving removes the row from the default "Active" view, but only
      // flips the badge when archived courses are already on screen.
      query.status === "active"
        ? { type: "remove", id: course.id }
        : { type: "patch", id: course.id, patch: { isArchived: true } },
      () => archiveCourse(course.id),
      {
        success: "Course archived",
        error: "Could not archive course",
        description: () => course.title,
      }
    ).finally(() => {
      setBusy(false);
      setArchiving(null);
    });
  };

  const handleRestore = (course: CourseWithCounts) => {
    void runMutation(
      query.status === "archived"
        ? { type: "remove", id: course.id }
        : { type: "patch", id: course.id, patch: { isArchived: false } },
      () => restoreCourse(course.id),
      {
        success: "Course restored",
        error: "Could not restore course",
        description: () => course.title,
      }
    );
  };

  const handleDelete = (course: CourseWithCounts) => {
    setBusy(true);

    void runMutation({ type: "remove", id: course.id }, () => deleteCourse(course.id), {
      success: "Course deleted",
      error: "Could not delete course",
      description: () => course.title,
    }).finally(() => {
      setBusy(false);
      setDeleting(null);
    });
  };

  /* -------------------------------- columns -------------------------------- */

  const columns = React.useMemo<ReadonlyArray<DataTableColumn<CourseWithCounts>>>(
    () => [
      {
        id: "title",
        header: "Course",
        headerLabel: "Course",
        sortable: true,
        locked: true,
        className: "min-w-[13rem]",
        cell: (course) => (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand dark:text-brand-accent"
            >
              <BookOpenIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{course.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {course.code}
                {course.academicYear ? ` · ${course.academicYear}` : ""}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "academicYear",
        header: "Year",
        headerLabel: "Academic year",
        hideBelow: "xl",
        cell: (course) => (
          <span className="text-muted-foreground tabular-nums">
            {course.academicYear ?? "—"}
          </span>
        ),
      },
      {
        id: "studentCount",
        header: "Students",
        headerLabel: "Students",
        sortable: true,
        align: "end",
        hideBelow: "sm",
        cell: (course) => <span className="tabular-nums">{course.studentCount}</span>,
      },
      {
        id: "examCount",
        header: "Exams",
        headerLabel: "Exams",
        sortable: true,
        align: "end",
        hideBelow: "md",
        cell: (course) => <span className="tabular-nums">{course.examCount}</span>,
      },
      {
        id: "status",
        header: "Status",
        headerLabel: "Status",
        align: "end",
        cell: (course) =>
          course.isArchived ? (
            <StatusBadge tone="neutral">Archived</StatusBadge>
          ) : (
            <StatusBadge tone="success">Active</StatusBadge>
          ),
      },
      {
        id: "createdAt",
        header: "Created",
        headerLabel: "Created",
        sortable: true,
        align: "end",
        hideBelow: "lg",
        cell: (course) => (
          <time
            dateTime={new Date(course.createdAt).toISOString()}
            className="text-muted-foreground tabular-nums"
          >
            {dateFormatter.format(new Date(course.createdAt))}
          </time>
        ),
      },
    ],
    []
  );

  // Not memoized: the handlers close over the current status filter, which
  // decides whether a restored row disappears or merely changes badge, and the
  // array is four objects.
  const rowActions: ReadonlyArray<DataTableRowAction<CourseWithCounts>> = [
    {
      id: "edit",
      label: "Edit course",
      icon: PencilIcon,
      onSelect: (course) => {
        setEditing(course);
        setFormOpen(true);
      },
    },
    {
      id: "archive",
      label: "Archive",
      icon: ArchiveIcon,
      disabled: (course) => course.isArchived,
      onSelect: (course) => setArchiving(course),
    },
    {
      id: "restore",
      label: "Restore",
      icon: ArchiveRestoreIcon,
      disabled: (course) => !course.isArchived,
      onSelect: handleRestore,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2Icon,
      destructive: true,
      separatorBefore: true,
      onSelect: (course) => setDeleting(course),
    },
  ];

  /* --------------------------------- sort ---------------------------------- */

  const sort: SortState = { columnId: query.sortBy, direction: query.sortDirection };

  const handleSortChange = (next: SortState) =>
    updateQuery({ sortBy: next.columnId, sortDirection: next.direction });

  const activePreset = presetFor(query.sortBy, query.sortDirection);

  /* --------------------------------- render -------------------------------- */

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const createButton = (
    <PrimaryButton icon={PlusIcon} onClick={openCreate}>
      Create course
    </PrimaryButton>
  );

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-4 pt-4 sm:px-5">
          <AppDataToolbar
            search={
              <SearchBar
                label="Search courses"
                placeholder="Search by name or code…"
                value={searchText}
                onChange={setSearchText}
                debounceMs={350}
                onDebouncedChange={(value) => updateQuery({ search: value })}
              />
            }
            filters={
              <>
                <FilterDropdown
                  label="Status"
                  icon={CircleDotIcon}
                  multiple={false}
                  value={[query.status]}
                  // Deselecting the current option clears the parameter, which
                  // falls back to the "Active" default rather than showing
                  // nothing.
                  onChange={([status]) => updateQuery({ status })}
                  options={[
                    { value: "active", label: "Active", count: counts.active },
                    { value: "archived", label: "Archived", count: counts.archived },
                    { value: "all", label: "All courses", count: counts.total },
                  ]}
                />

                {academicYears.length > 0 ? (
                  <FilterDropdown
                    label="Year"
                    icon={CalendarRangeIcon}
                    multiple={false}
                    value={query.academicYear ? [query.academicYear] : []}
                    onChange={([academicYear]) => updateQuery({ academicYear })}
                    options={academicYears.map((year) => ({
                      value: year,
                      label: year,
                    }))}
                  />
                ) : null}

                <FilterDropdown
                  label="Sort"
                  icon={ArrowDownUpIcon}
                  multiple={false}
                  value={[activePreset.value]}
                  onChange={([value]) => {
                    const preset =
                      SORT_PRESETS.find((option) => option.value === value) ??
                      SORT_PRESETS[0];
                    updateQuery({
                      sortBy: preset.sortBy,
                      sortDirection: preset.sortDirection,
                    });
                  }}
                  options={SORT_PRESETS.map(({ value, label }) => ({ value, label }))}
                />

                {activeFilterCount > 0 ? (
                  <ResetFiltersButton onReset={resetFilters} count={activeFilterCount} />
                ) : null}
              </>
            }
            actions={
              <>
                <AppColumnSelector
                  columns={columns}
                  hidden={hiddenColumns}
                  onChange={setHiddenColumns}
                />
                <div className="hidden sm:block">{createButton}</div>
              </>
            }
            chips={
              activeFilterCount > 0 ? (
                <>
                  {query.search ? (
                    <FilterChip
                      label="Search"
                      value={query.search}
                      onRemove={() => updateQuery({ search: undefined })}
                    />
                  ) : null}
                  {query.status !== "active" ? (
                    <FilterChip
                      label="Status"
                      value={STATUS_LABELS[query.status]}
                      onRemove={() => updateQuery({ status: undefined })}
                    />
                  ) : null}
                  {query.academicYear ? (
                    <FilterChip
                      label="Year"
                      value={query.academicYear}
                      onRemove={() => updateQuery({ academicYear: undefined })}
                    />
                  ) : null}
                </>
              ) : null
            }
            className="pb-4"
          />
        </div>

        {/* Dimmed rather than replaced while a query is in flight: swapping in a
            skeleton would throw away the rows the teacher is still reading. */}
        <div
          aria-busy={isPending || undefined}
          className={cn(
            "transition-opacity duration-150",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          <AppDataTable
            caption="Your courses"
            columns={columns}
            rows={rows}
            rowKey={(course) => course.id}
            rowActions={rowActions}
            hiddenColumns={hiddenColumns}
            manualSorting
            sort={sort}
            onSortChange={handleSortChange}
            pagination={{
              page: page.page,
              pageSize: page.pageSize,
              total: page.total,
            }}
            onPageChange={(next) => updateQuery({ page: next })}
            onPageSizeChange={(size) => updateQuery({ pageSize: size, page: 1 })}
            paginationLabel="courses"
            empty={
              filtersApplied ? (
                <NoSearchResults
                  query={query.search}
                  onReset={
                    <ResetFiltersButton onReset={resetFilters} count={activeFilterCount} />
                  }
                />
              ) : (
                <NoCourses action={createButton} />
              )
            }
          />
        </div>
      </Card>

      {/* Mobile keeps the primary action within thumb reach instead of in the
          toolbar, where it would compete with the filters for width. */}
      <PrimaryButton icon={PlusIcon} onClick={openCreate} className="w-full sm:hidden">
        Create course
      </PrimaryButton>

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editing}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => {
          if (!open) setArchiving(null);
        }}
        title="Archive this course?"
        description={
          archiving
            ? `“${archiving.title}” will be hidden from your active list and from your students. Nothing is deleted, and you can restore it at any time.`
            : undefined
        }
        confirmLabel="Archive course"
        icon={ArchiveIcon}
        loading={busy}
        onConfirm={() => {
          if (archiving) handleArchive(archiving);
        }}
      />

      <DeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this course?"
        itemName={deleting?.title}
        description={
          deleting
            ? `“${deleting.title}” will be removed from your dashboard. Its exams and results are kept for your records, but nobody will be able to open the course again.`
            : undefined
        }
        confirmLabel="Delete course"
        // Typing the name is warranted here: the course may hold a term of
        // exams and results, and there is no restore button for a deletion.
        requireTypedConfirmation={Boolean(
          deleting && (deleting.examCount > 0 || deleting.studentCount > 0)
        )}
        loading={busy}
        onConfirm={() => {
          if (deleting) handleDelete(deleting);
        }}
      />
    </>
  );
}
