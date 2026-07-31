import { motion, useReducedMotion } from "motion/react";
import { lazy, type ReactNode, Suspense } from "react";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseList } from "@/features/endpoints/components/response-list";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const ResponsePreview = lazy(() =>
  import("@/features/endpoints/components/response-preview").then(
    ({ ResponsePreview }) => ({ default: ResponsePreview })
  )
);

type EndpointDetailLayoutProps = {
  endpointId: string;
  endpointSlug: string;
  responses: EndpointResponse[];
  selectedResponse: EndpointResponse | null;
  selectedResponseId: string | null;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelectResponse: (id: string) => void;
  onActivateResponse: (response: EndpointResponse) => void;
  onCloneResponse: (response: EndpointResponse) => void;
  onDeactivateResponse: (response: EndpointResponse) => void;
  onEditResponseDirtyChange?: (isDirty: boolean) => void;
  endpointUrl?: string;
  endpointMethod?: HttpMethod;
  previewTourId?: string;
  responsesTourId?: string;
};

export function EndpointDetailLayout({
  endpointId,
  endpointSlug,
  responses,
  selectedResponse,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onCloneResponse,
  onDeactivateResponse,
  onEditResponseDirtyChange,
  endpointUrl,
  endpointMethod,
  previewTourId,
  responsesTourId,
}: EndpointDetailLayoutProps) {
  return (
    <>
      {/* Mobile: Tabs layout */}
      <Card className="overflow-hidden lg:hidden">
        <Tabs defaultValue="responses">
          <div className="border-b px-4 py-2">
            <TabsList className="w-auto">
              <TabsTrigger value="responses">
                Responses ({responses.length})
              </TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="mt-0" value="responses">
            <EndpointContentTransition
              transitionKey={`responses-${endpointId}`}
            >
              <ResponseList
                endpointId={endpointId}
                endpointSlug={endpointSlug}
                isActivating={isActivating}
                isDeactivating={isDeactivating}
                onActivateResponse={onActivateResponse}
                onCloneResponse={onCloneResponse}
                onDeactivateResponse={onDeactivateResponse}
                onEditResponseDirtyChange={onEditResponseDirtyChange}
                onSelectResponse={onSelectResponse}
                responses={responses}
                selectedResponseId={selectedResponseId}
              />
            </EndpointContentTransition>
          </TabsContent>
          <TabsContent className="mt-0" value="preview">
            <EndpointContentTransition transitionKey={`preview-${endpointId}`}>
              <Suspense fallback={<ResponsePreviewFallback />}>
                <ResponsePreview
                  endpointMethod={endpointMethod}
                  endpointUrl={endpointUrl}
                  response={selectedResponse}
                />
              </Suspense>
            </EndpointContentTransition>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Desktop: Resizable panels */}
      <Card className="hidden overflow-hidden lg:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} id={responsesTourId} minSize={25}>
            <EndpointContentTransition
              transitionKey={`responses-${endpointId}`}
            >
              <ResponseList
                endpointId={endpointId}
                endpointSlug={endpointSlug}
                isActivating={isActivating}
                isDeactivating={isDeactivating}
                onActivateResponse={onActivateResponse}
                onCloneResponse={onCloneResponse}
                onDeactivateResponse={onDeactivateResponse}
                onEditResponseDirtyChange={onEditResponseDirtyChange}
                onSelectResponse={onSelectResponse}
                responses={responses}
                selectedResponseId={selectedResponseId}
              />
            </EndpointContentTransition>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} id={previewTourId} minSize={35}>
            <Suspense fallback={<ResponsePreviewFallback />}>
              <EndpointContentTransition
                transitionKey={`preview-${endpointId}`}
              >
                <ResponsePreview
                  endpointMethod={endpointMethod}
                  endpointUrl={endpointUrl}
                  response={selectedResponse}
                />
              </EndpointContentTransition>
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}

function EndpointContentTransition({
  children,
  transitionKey,
}: {
  readonly children: ReactNode;
  readonly transitionKey: string;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
      key={transitionKey}
      transition={{ duration: MOTION_DURATION.press, ease: MOTION_EASE.out }}
    >
      {children}
    </motion.div>
  );
}

function ResponsePreviewFallback() {
  return <div className="min-h-[480px] bg-background" />;
}
