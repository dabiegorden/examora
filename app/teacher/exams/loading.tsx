import {
  CardGridSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  StatCardsSkeleton,
} from "@/components/dashboard";

export default function Loading() {
  return (
    <LoadingRegion label="Loading exams">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      <CardGridSkeleton />
    </LoadingRegion>
  );
}
