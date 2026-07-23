import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseList } from "@/features/endpoints/components/response-list";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";

const ResponsePreview = lazy(() =>
  import("@/features/endpoints/components/response-preview").then(
    ({ ResponsePreview }) => ({ default: ResponsePreview })
  )
);

type EndpointDetailLayoutProps = {
  endpointId: string;
  responses: EndpointResponse[];
  selectedResponse: EndpointResponse | null;
  selectedResponseId: string | null;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelectResponse: (id: string) => void;
  onActivateResponse: (response: EndpointResponse) => void;
  onDeactivateResponse: (response: EndpointResponse) => void;
  endpointUrl?: string;
  endpointMethod?: HttpMethod;
  previewTourId?: string;
  responsesTourId?: string;
};

export function EndpointDetailLayout({
  endpointId,
  responses,
  selectedResponse,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onDeactivateResponse,
  endpointUrl,
  endpointMethod,
  previewTourId,
  responsesTourId,
}: EndpointDetailLayoutProps) {
  return (
    <>
      {/* Mobile: Tabs layout */}
      <Card className="overflow-hidden md:hidden">
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
            <ResponseList
              endpointId={endpointId}
              isActivating={isActivating}
              isDeactivating={isDeactivating}
              onActivateResponse={onActivateResponse}
              onDeactivateResponse={onDeactivateResponse}
              onSelectResponse={onSelectResponse}
              responses={responses}
              selectedResponseId={selectedResponseId}
            />
          </TabsContent>
          <TabsContent className="mt-0" value="preview">
            <Suspense fallback={<ResponsePreviewFallback />}>
              <ResponsePreview
                endpointMethod={endpointMethod}
                endpointUrl={endpointUrl}
                response={selectedResponse}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Desktop: Resizable panels */}
      <Card className="hidden overflow-hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} id={responsesTourId} minSize={25}>
            <ResponseList
              endpointId={endpointId}
              isActivating={isActivating}
              isDeactivating={isDeactivating}
              onActivateResponse={onActivateResponse}
              onDeactivateResponse={onDeactivateResponse}
              onSelectResponse={onSelectResponse}
              responses={responses}
              selectedResponseId={selectedResponseId}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} id={previewTourId} minSize={35}>
            <Suspense fallback={<ResponsePreviewFallback />}>
              <ResponsePreview
                endpointMethod={endpointMethod}
                endpointUrl={endpointUrl}
                response={selectedResponse}
              />
            </Suspense>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}

function ResponsePreviewFallback() {
  return <div className="min-h-[480px] bg-background" />;
}
