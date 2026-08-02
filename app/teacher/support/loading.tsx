import {
  ListSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <LoadingRegion label="Loading">
      <PageHeaderSkeleton />
      <Card>
        <CardContent>
          <ListSkeleton rows={6} />
        </CardContent>
      </Card>
    </LoadingRegion>
  );
}
