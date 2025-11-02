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
      <Card className="overflow-hidden md:hidden">
        <div className="border-b px-4 py-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <div className="space-y-1 p-2">
          {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
            <div
              className="space-y-2 rounded-lg border p-3"
              key={`skeleton-response-${index + 1}`}
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Card>

      {/* Desktop: Resizable panels skeleton */}
      <Card className="hidden overflow-hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-1 p-2">
                {Array.from({ length: SKELETON_RESPONSE_COUNT }, (_, index) => (
                  <div
                    className="space-y-2 rounded-lg border p-3"
                    key={`skeleton-response-${index + 1}`}
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={35}>
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-3">
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}
