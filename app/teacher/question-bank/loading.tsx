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
      <StatCardsSkeleton count={3} />
      <TableSkeleton rows={8} columns={5} />
    </LoadingRegion>
  );
}
