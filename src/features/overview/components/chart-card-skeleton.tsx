import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ChartCardSkeletonProps = {
  className?: string;
};

export function ChartCardSkeleton({ className }: ChartCardSkeletonProps) {
  return (
    <Card className={`border-border/70 bg-card/90 ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle>
          <Skeleton className="h-5 w-48 max-w-full" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-64 max-w-full" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[260px] w-full items-center justify-center">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
