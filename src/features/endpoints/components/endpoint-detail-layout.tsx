import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  onAddResponse: () => void;
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
  onAddResponse,
}: EndpointDetailLayoutProps) {
  return (
    <Card className="overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={25}>
          <ResponseList
            isActivating={isActivating}
            isDeactivating={isDeactivating}
            onActivateResponse={onActivateResponse}
            onAddResponse={onAddResponse}
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
  );
}
