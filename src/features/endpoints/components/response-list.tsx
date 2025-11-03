import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProtectedAction } from "@/features/auth/components/protected-action";
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
  onAddResponse: () => void;
};

export function ResponseList({
  responses,
  selectedResponseId,
  isActivating,
  isDeactivating,
  onSelectResponse,
  onActivateResponse,
  onDeactivateResponse,
  onAddResponse,
}: ResponseListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold text-sm">Responses</h2>
      </div>
      <ScrollArea className="flex-1">
        {responses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No responses configured yet.
            </p>
            <ProtectedAction ability="canAddResponse">
              <Button
                className="mt-4"
                onClick={onAddResponse}
                size="sm"
                variant="outline"
              >
                Add First Response
              </Button>
            </ProtectedAction>
          </div>
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
