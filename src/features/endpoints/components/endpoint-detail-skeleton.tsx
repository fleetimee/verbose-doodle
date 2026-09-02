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
      <Card className="overflow-hidden rounded-2xl border-2 border-border/80 border-b-4 bg-card/90 shadow-sm md:hidden">
        <div className="border-b px-4 py-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2 p-2">
          {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
            <div
              className="space-y-2 rounded-2xl border-2 border-border/70 border-b-4 p-3.5"
              key={`skeleton-response-${index + 1}`}
            >
              <Skeleton className="h-4 w-32 rounded-lg" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12 rounded-xl" />
                <Skeleton className="h-5 w-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Desktop: Resizable panels skeleton */}
      <Card className="hidden overflow-hidden rounded-2xl border-2 border-border/80 border-b-4 bg-card/90 shadow-sm md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <Skeleton className="h-5 w-24 rounded-xl" />
              </div>
              <div className="space-y-2 p-2">
                {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
                  <div
                    className="space-y-2 rounded-2xl border-2 border-border/70 border-b-4 p-3.5"
                    key={`skeleton-response-${index + 1}`}
                  >
                    <Skeleton className="h-4 w-32 rounded-lg" />
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-12 rounded-xl" />
                      <Skeleton className="h-5 w-16 rounded-xl" />
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
                <Skeleton className="h-5 w-32 rounded-xl" />
              </div>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 rounded-xl" />
                  <Skeleton className="h-5 w-24 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                {/* Simulation Alert Skeleton */}
                <Skeleton className="h-24 w-full rounded-2xl" />
                {/* Code Block Skeleton */}
                <Skeleton className="h-[300px] w-full rounded-2xl" />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}
