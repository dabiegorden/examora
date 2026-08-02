import {
  LoadingRegion,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard";

export default function Loading() {
  return (
    <LoadingRegion label="Loading">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <TableSkeleton rows={7} columns={3} />
    </LoadingRegion>
  );
}
