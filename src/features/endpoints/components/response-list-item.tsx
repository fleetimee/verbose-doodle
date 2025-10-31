import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EndpointResponse } from "@/features/endpoints/types";
import { cn } from "@/lib/utils";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

type ResponseListItemProps = {
  response: EndpointResponse;
  isSelected: boolean;
  isActivating: boolean;
  onSelect: (id: string) => void;
  onActivate: (response: EndpointResponse) => void;
};

export function ResponseListItem({
  response,
  isSelected,
  isActivating,
  onSelect,
  onActivate,
}: ResponseListItemProps) {
  const isActive = response.activated;

  return (
    <button
      className={cn(
        "w-full rounded-md px-3 py-2.5 text-left transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      key={response.id}
      onClick={() => {
        onSelect(response.id);
      }}
      type="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{response.name}</span>
            {isActive && (
              <Badge className="text-xs" variant="secondary">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="font-mono text-xs"
              variant={
                response.statusCode < SUCCESS_STATUS_CODE_THRESHOLD
                  ? "default"
                  : "destructive"
              }
            >
              {response.statusCode}
            </Badge>
          </div>
        </div>
        <button
          className={cn(
            "rounded-full p-0.5 transition-colors",
            isActive
              ? "text-green-600 dark:text-green-500"
              : "text-muted-foreground hover:text-foreground",
            isActivating && "opacity-50"
          )}
          disabled={isActivating || isActive}
          onClick={(e) => {
            e.stopPropagation();
            onActivate(response);
          }}
          title={isActive ? "Currently active" : "Activate this response"}
          type="button"
        >
          {isActive ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
      </div>
    </button>
  );
}
