import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_RESPONSE_COUNT = 3;

export function EndpointDetailSkeleton() {
  return (
    <>
      {/* Mobile: Simple card with skeleton */}
      <Card className="overflow-hidden md:hidden" variant="elevated-subtle">
        <div className="border-b px-4 py-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" variant="xl" />
            <Skeleton className="h-5 w-16" variant="xl" />
          </div>
        </div>
        <div className="space-y-2 p-2">
          {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
            <div
              className="space-y-2 rounded-2xl border-2 border-border/70 border-b-4 p-3.5"
              key={`skeleton-response-${index + 1}`}
            >
              <Skeleton className="h-4 w-32" variant="lg" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12" variant="xl" />
                <Skeleton className="h-5 w-16" variant="xl" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Desktop: Resizable panels skeleton */}
      <Card
        className="hidden overflow-hidden md:block"
        variant="elevated-subtle"
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <Skeleton className="h-5 w-24" variant="xl" />
              </div>
              <div className="space-y-2 p-2">
                {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
                  <div
                    className="space-y-2 rounded-2xl border-2 border-border/70 border-b-4 p-3.5"
                    key={`skeleton-response-${index + 1}`}
                  >
                    <Skeleton className="h-4 w-32" variant="lg" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-12" variant="xl" />
                      <Skeleton className="h-5 w-16" variant="xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={35}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <Skeleton className="h-5 w-32" variant="xl" />
              </div>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" variant="xl" />
                  <Skeleton className="h-5 w-24" variant="xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" variant="lg" />
                  <Skeleton className="h-10 w-full" variant="xl" />
                </div>
                {/* Simulation Alert Skeleton */}
                <Skeleton className="h-24 w-full" variant="2xl" />
                {/* Code Block Skeleton */}
                <Skeleton className="h-[300px] w-full" variant="2xl" />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}
