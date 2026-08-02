import {
  CardGridSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard";

export default function Loading() {
  return (
    <LoadingRegion label="Loading your dashboard">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <CardGridSkeleton />
      <TableSkeleton rows={5} />
    </LoadingRegion>
  );
}
