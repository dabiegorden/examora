import {
  LoadingRegion,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/app/feedback";

/**
 * Shown while the course query runs.
 *
 * The shape mirrors the real page — header, three stat cards, a table with a
 * toolbar — so nothing jumps when the data lands.
 */
export default function Loading() {
  return (
    <LoadingRegion label="Loading courses">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} />
      <TableSkeleton rows={8} columns={5} />
    </LoadingRegion>
  );
}
