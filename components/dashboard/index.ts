/**
 * Dashboard component barrel.
 *
 * Pages import from here so a component can be moved or renamed without
 * touching every page that uses it.
 */

export { ActivityTimeline } from "./activity-timeline";
export { AppSidebar } from "./app-sidebar";
export { DashboardCard, DashboardSection } from "./dashboard-card";
export { DashboardFooter } from "./dashboard-footer";
export { DashboardHeader } from "./dashboard-header";
export { DashboardTable, type Column } from "./dashboard-table";
export { DataToolbar, PaginationBar, type FilterConfig } from "./data-toolbar";
export { EmptyState } from "./empty-state";
export { ErrorState } from "./error-state";
export { PageHeader, SectionTitle } from "./page-header";
export { QuickActionCard } from "./quick-action-card";
export { SearchBar } from "./search-bar";
export { StatCard } from "./stat-card";
export {
  ArchivedBadge,
  ComingSoonBadge,
  DifficultyBadge,
  ExamStatusBadge,
  StudentStatusBadge,
} from "./status-badge";
export {
  CardGridSkeleton,
  ListSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "./skeletons";
export { initialsFor } from "@/utils/text";
