import {
  CheckmarkCircle02Icon,
  Clock03Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  CircleOff,
  FileJson,
  Hash,
  MoreHorizontal,
  TextCursor,
} from "@/components/hugeicons";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/context";
import { EditResponseStepper } from "@/features/endpoints/components/edit-response-stepper";
import { ResponseContextMenu } from "@/features/endpoints/components/response-context-menu";
import { ResponseSimulationBadge } from "@/features/endpoints/components/response-simulation-badge";
import { SimulateTimeoutDialog } from "@/features/endpoints/components/simulate-timeout-dialog";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { EndpointResponse } from "@/features/endpoints/types";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;
type ResponseListItemProps = {
  endpointId: string;
  endpointSlug: string;
  response: EndpointResponse;
  isSelected: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelect: (id: string) => void;
  onActivate: (response: EndpointResponse) => void;
  onDeactivate: (response: EndpointResponse) => void;
  onEditDirtyChange?: (isDirty: boolean) => void;
};

// Helper to get status code badge variant
function getStatusCodeVariant(statusCode: number) {
  return statusCode < SUCCESS_STATUS_CODE_THRESHOLD ? "default" : "destructive";
}

// Helper to get item container classes
function getItemContainerClasses(isSelected: boolean, isActive: boolean) {
  let stateClasses =
    "border-transparent hover:border-border hover:bg-accent/50 hover:shadow-xs";

  if (isSelected) {
    stateClasses =
      "border-primary/35 bg-primary/10 text-accent-foreground shadow-md before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary dark:bg-primary/15";
  } else if (isActive) {
    stateClasses =
      "border-emerald-500/20 bg-emerald-500/5 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r-full before:bg-emerald-500/70 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-xs dark:bg-emerald-500/[0.04]";
  }

  return cn(
    "relative w-full cursor-pointer overflow-hidden rounded-md border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,color]",
    stateClasses,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );
}

export function ResponseListItem({
  endpointId,
  endpointSlug,
  response,
  isSelected,
  isActivating,
  isDeactivating,
  onSelect,
  onActivate,
  onDeactivate,
  onEditDirtyChange,
}: ResponseListItemProps) {
  const { session } = useAuth();
  const canActivateResponse = session.can("canActivateResponse");

  const isActive = response.activated;
  const isLoading = isActivating || isDeactivating;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSimulateDialog, setShowSimulateDialog] = useState(false);
  const [showEditStepper, setShowEditStepper] = useState(false);
  const [editType, setEditType] = useState<"name" | "statusCode" | "json">(
    "name"
  );

  const { updateResponse: updateResponseMutation, deleteResponse } =
    useEndpointWorkspace(endpointSlug);
  const { mutate: updateResponse, isPending: isUpdating } =
    updateResponseMutation;
  const { mutate: deleteResponseMutation, isPending: isDeleting } =
    deleteResponse;

  const handleConfirm = () => {
    if (isActive) {
      onDeactivate(response);
    } else {
      onActivate(response);
    }
    setShowConfirmDialog(false);
  };

  const handleEditClick = (type: "name" | "statusCode" | "json") => {
    setEditType(type);
    setShowEditStepper(true);
  };

  const handleEditSubmit = (data: {
    name?: string;
    statusCode?: number;
    json?: string;
  }) => {
    updateResponse(
      {
        changes: data,
        endpointId,
        responseId: response.id,
      },
      {
        onSuccess: () => {
          setShowEditStepper(false);
        },
      }
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteResponseMutation(
      { endpointId, responseId: response.id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(response.id);
    }
  };

  const activationButtonTitle = isActive
    ? formatMessage(messages.endpoints.deactivateResponseTooltip, {
        name: response.name,
      })
    : formatMessage(messages.endpoints.activateResponseTooltip, {
        name: response.name,
      });

  const moreActionsButtonTitle = `More response actions for ${response.name}`;

  return (
    <>
      <ResponseContextMenu
        enabled={canActivateResponse}
        isActive={isActive}
        isLoading={isLoading}
        isSelected={isSelected}
        onActivate={() => setShowConfirmDialog(true)}
        onDeactivate={() => setShowConfirmDialog(true)}
        onDelete={handleDeleteClick}
        onEdit={handleEditClick}
        onSimulate={() => setShowSimulateDialog(true)}
        response={response}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: Nested action controls prevent using a button element. */}
        <div
          className={getItemContainerClasses(isSelected, isActive)}
          onClick={() => {
            onSelect(response.id);
          }}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base leading-none">
                  {response.name}
                </span>
                {isActive && (
                  <div>
                    <Badge
                      className="flex items-center gap-1.5 bg-background/70 text-xs shadow-xs"
                      variant="secondary"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className="font-mono text-xs shadow-xs"
                  variant={getStatusCodeVariant(response.statusCode)}
                >
                  {response.statusCode}
                </Badge>
                <ResponseSimulationBadge response={response} />
              </div>
            </div>
            {canActivateResponse && (
              <div className="flex items-center gap-1.5">
                {!isActive && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label={activationButtonTitle}
                        className="border-emerald-500/35 bg-emerald-500/10 text-emerald-700 hover:border-emerald-500/50 hover:bg-emerald-500/15 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirmDialog(true);
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          strokeWidth={2}
                        />
                        Set active
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {activationButtonTitle}
                    </TooltipContent>
                  </Tooltip>
                )}
                <DropdownMenu>
                  <Tooltip>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label={moreActionsButtonTitle}
                          className="cursor-pointer"
                          disabled={!isSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <MoreHorizontal />
                        </Button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent side="top">
                      More response actions
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-xl p-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick("name");
                      }}
                    >
                      <TextCursor className="h-4 w-4" />
                      Edit Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick("statusCode");
                      }}
                    >
                      <Hash className="h-4 w-4" />
                      Edit Status Code
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick("json");
                      }}
                    >
                      <FileJson className="h-4 w-4" />
                      Edit JSON Response
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSimulateDialog(true);
                      }}
                    >
                      <HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />
                      Simulate timeout
                    </DropdownMenuItem>
                    {isActive && (
                      <DropdownMenuItem
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirmDialog(true);
                        }}
                      >
                        <CircleOff className="h-4 w-4" />
                        Deactivate response
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                    >
                      <HugeiconsIcon
                        className="h-4 w-4 text-red-600"
                        icon={Delete02Icon}
                        strokeWidth={2}
                      />
                      Delete Response
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </ResponseContextMenu>

      <SimulateTimeoutDialog
        endpointId={endpointId}
        endpointSlug={endpointSlug}
        onOpenChange={setShowSimulateDialog}
        open={showSimulateDialog}
        response={response}
      />

      <AnimatePresence>
        {showEditStepper && (
          <EditResponseStepper
            editType={editType}
            isSubmitting={isUpdating}
            onCancel={() => setShowEditStepper(false)}
            onDirtyChange={onEditDirtyChange}
            onSubmit={handleEditSubmit}
            response={response}
          />
        )}
      </AnimatePresence>

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

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{response.name}"</span>? This
              action cannot be undone and will permanently remove this response
              configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
