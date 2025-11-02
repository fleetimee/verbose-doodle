import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { EndpointResponse } from "@/features/endpoints/types";
import { cn } from "@/lib/utils";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;

type ResponseListItemProps = {
  response: EndpointResponse;
  isSelected: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelect: (id: string) => void;
  onActivate: (response: EndpointResponse) => void;
  onDeactivate: (response: EndpointResponse) => void;
};

export function ResponseListItem({
  response,
  isSelected,
  isActivating,
  isDeactivating,
  onSelect,
  onActivate,
  onDeactivate,
}: ResponseListItemProps) {
  const isActive = response.activated;
  const isLoading = isActivating || isDeactivating;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirm = () => {
    if (isActive) {
      onDeactivate(response);
    } else {
      onActivate(response);
    }
    setShowConfirmDialog(false);
  };

  return (
    <>
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
                ? "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                : "text-muted-foreground hover:text-foreground",
              isLoading && "cursor-not-allowed opacity-50"
            )}
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDialog(true);
            }}
            title={
              isActive ? "Deactivate this response" : "Activate this response"
            }
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

      <AlertDialog onOpenChange={setShowConfirmDialog} open={showConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Deactivate Response?" : "Activate Response?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive ? (
                <>
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold">"{response.name}"</span>? The
                  endpoint will return an empty response until you activate
                  another response.
                </>
              ) : (
                <>
                  Are you sure you want to activate{" "}
                  <span className="font-semibold">"{response.name}"</span>? This
                  will deactivate any currently active response.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
