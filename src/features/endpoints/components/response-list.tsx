import { ListX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponseListItem } from "@/features/endpoints/components/response-list-item";
import type { EndpointResponse } from "@/features/endpoints/types";

type ResponseListProps = {
  responses: EndpointResponse[];
  selectedResponseId: string | null;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelectResponse: (id: string) => void;
  onActivateResponse: (response: EndpointResponse) => void;
  onDeactivateResponse: (response: EndpointResponse) => void;
};

export function ResponseList({
  responses,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onDeactivateResponse,
}: ResponseListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-sm">Responses</h2>
      </div>
      <ScrollArea className="flex-1">
        {responses.length === 0 ? (
          <Empty className="min-h-[300px] border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListX />
              </EmptyMedia>
              <EmptyTitle>No responses configured yet</EmptyTitle>
              <EmptyDescription>
                Add a response using the button above to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-1 p-2">
            {responses.map((response) => (
              <ResponseListItem
                isActivating={isActivating}
                isDeactivating={isDeactivating}
                isSelected={selectedResponseId === response.id}
                key={response.id}
                onActivate={onActivateResponse}
                onDeactivate={onDeactivateResponse}
                onSelect={onSelectResponse}
                response={response}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
