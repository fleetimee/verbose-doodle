import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseList } from "@/features/endpoints/components/response-list";
import { ResponsePreview } from "@/features/endpoints/components/response-preview";
import type { EndpointResponse } from "@/features/endpoints/types";

type EndpointDetailLayoutProps = {
  responses: EndpointResponse[];
  selectedResponse: EndpointResponse | null;
  selectedResponseId: string | null;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelectResponse: (id: string) => void;
  onActivateResponse: (response: EndpointResponse) => void;
  onDeactivateResponse: (response: EndpointResponse) => void;
};

export function EndpointDetailLayout({
  responses,
  selectedResponse,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onDeactivateResponse,
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
            <ResponsePreview response={selectedResponse} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Desktop: Resizable panels */}
      <Card className="hidden overflow-hidden md:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            <ResponseList
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

          <ResizablePanel defaultSize={65} minSize={35}>
            <ResponsePreview response={selectedResponse} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </>
  );
}
