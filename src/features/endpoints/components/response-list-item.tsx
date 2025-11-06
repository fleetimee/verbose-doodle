import { CheckCircle2, Circle, Timer } from "lucide-react";
import { motion } from "motion/react";
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { ResponseSimulationBadge } from "@/features/endpoints/components/response-simulation-badge";
import { SimulateTimeoutDialog } from "@/features/endpoints/components/simulate-timeout-dialog";
import type { EndpointResponse } from "@/features/endpoints/types";
import { cn } from "@/lib/utils";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;
const SELECTED_ITEM_SCALE = 1.02;

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
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });
  const canActivateResponse = can("canActivateResponse");

  const isActive = response.activated;
  const isLoading = isActivating || isDeactivating;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSimulateDialog, setShowSimulateDialog] = useState(false);

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
      <motion.div
        animate={{
          scale: isSelected ? SELECTED_ITEM_SCALE : 1,
        }}
        className={cn(
          "w-full cursor-pointer rounded-md px-3 py-2.5 text-left transition-colors duration-200",
          isSelected
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        initial={false}
        key={response.id}
        layout
        onClick={() => {
          onSelect(response.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(response.id);
          }
        }}
        role="button"
        tabIndex={0}
        transition={{
          layout: { duration: 0.2, ease: "easeOut" },
          scale: { duration: 0.2, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{response.name}</span>
              {isActive && (
                <Badge className="text-xs" variant="secondary">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
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
              <ResponseSimulationBadge response={response} />
            </div>
          </div>
          {canActivateResponse && (
            <div className="flex items-center gap-1">
              <Button
                className="h-7 w-7 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSimulateDialog(true);
                }}
                size="icon"
                title="Simulate timeout or delay"
                type="button"
                variant="ghost"
              >
                <Timer className="h-4 w-4" />
              </Button>
              <button
                className={cn(
                  "rounded-full p-0.5 transition-colors",
                  isActive
                    ? "text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                    : "text-muted-foreground hover:text-foreground",
                  isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDialog(true);
                }}
                title={
                  isActive
                    ? "Deactivate this response"
                    : "Activate this response"
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
          )}
        </div>
      </motion.div>

      <SimulateTimeoutDialog
        onOpenChange={setShowSimulateDialog}
        open={showSimulateDialog}
        response={response}
      />

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
