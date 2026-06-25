import {
  CheckCircle2,
  Circle,
  FileJson,
  Hash,
  Pen,
  TextCursor,
  Timer,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { EditResponseStepper } from "@/features/endpoints/components/edit-response-stepper";
import { ResponseSimulationBadge } from "@/features/endpoints/components/response-simulation-badge";
import { SimulateTimeoutDialog } from "@/features/endpoints/components/simulate-timeout-dialog";
import { useDeleteResponse } from "@/features/endpoints/hooks/use-delete-response";
import { useUpdateResponse } from "@/features/endpoints/hooks/use-update-response";
import type { EndpointResponse } from "@/features/endpoints/types";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SUCCESS_STATUS_CODE_THRESHOLD = 300;
const SELECTED_ITEM_SCALE = 1.01;

// Animation constants for smooth transitions
const ANIMATION_DURATION = 0.3;
const HOVER_SCALE = 1.01;
const SCALE_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 30,
} as const;

type ResponseListItemProps = {
  response: EndpointResponse;
  isSelected: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  onSelect: (id: string) => void;
  onActivate: (response: EndpointResponse) => void;
  onDeactivate: (response: EndpointResponse) => void;
};

// Helper to get status code badge variant
function getStatusCodeVariant(statusCode: number) {
  return statusCode < SUCCESS_STATUS_CODE_THRESHOLD ? "default" : "destructive";
}

// Helper to get item container classes
function getItemContainerClasses(isSelected: boolean) {
  return cn(
    "relative w-full cursor-pointer overflow-hidden rounded-md border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,color]",
    isSelected
      ? "border-primary/35 bg-primary/10 text-accent-foreground shadow-md before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary dark:bg-primary/15"
      : "border-transparent hover:border-border hover:bg-accent/50 hover:shadow-xs",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  );
}

// Helper to get activation button classes
function getActivationButtonClasses(isActive: boolean, isLoading: boolean) {
  return cn(
    "border bg-background/80 shadow-xs",
    isActive
      ? "border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-950/40 dark:hover:text-green-400"
      : "text-muted-foreground hover:text-foreground",
    isLoading ? "opacity-50" : ""
  );
}

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSimulateDialog, setShowSimulateDialog] = useState(false);
  const [showEditStepper, setShowEditStepper] = useState(false);
  const [editType, setEditType] = useState<"name" | "statusCode" | "json">(
    "name"
  );

  const { mutate: updateResponse, isPending: isUpdating } = useUpdateResponse();
  const { mutate: deleteResponse, isPending: isDeleting } = useDeleteResponse();

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
        responseId: response.id,
        ...data,
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
    deleteResponse(
      {
        responseId: response.id,
      },
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

  const editButtonTitle = isSelected
    ? formatMessage(messages.endpoints.editResponseTooltip, {
        name: response.name,
      })
    : formatMessage(messages.endpoints.selectResponseToEditTooltip, {
        name: response.name,
      });

  const simulateButtonTitle = isSelected
    ? formatMessage(messages.endpoints.simulateResponseTooltip, {
        name: response.name,
      })
    : formatMessage(messages.endpoints.selectResponseToSimulateTooltip, {
        name: response.name,
      });

  const activationButtonTitle = isActive
    ? formatMessage(messages.endpoints.deactivateResponseTooltip, {
        name: response.name,
      })
    : formatMessage(messages.endpoints.activateResponseTooltip, {
        name: response.name,
      });

  return (
    <>
      <motion.div
        animate={{
          scale: isSelected ? SELECTED_ITEM_SCALE : 1,
          opacity: 1,
        }}
        className={getItemContainerClasses(isSelected)}
        initial={false}
        key={response.id}
        layout
        onClick={() => {
          onSelect(response.id);
        }}
        onKeyDown={handleKeyDown}
        role="button"
        style={{
          transition: `background-color ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1), box-shadow ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
        tabIndex={0}
        transition={{
          layout: { type: "spring", stiffness: 400, damping: 30 },
          scale: SCALE_SPRING,
          opacity: { duration: ANIMATION_DURATION, ease: "easeOut" },
        }}
        whileHover={{ scale: isSelected ? SELECTED_ITEM_SCALE : HOVER_SCALE }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="relative flex items-start justify-between gap-3">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col gap-2.5"
            initial={false}
            transition={{
              duration: ANIMATION_DURATION,
              ease: "easeOut",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base leading-none">
                {response.name}
              </span>
              {isActive && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Badge
                    className="bg-background/70 text-xs shadow-xs"
                    variant="secondary"
                  >
                    Active
                  </Badge>
                </motion.div>
              )}
            </div>
            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-wrap items-center gap-1.5"
              initial={false}
              transition={{
                duration: ANIMATION_DURATION,
                ease: "easeOut",
              }}
            >
              <Badge
                className="font-mono text-xs shadow-xs"
                variant={getStatusCodeVariant(response.statusCode)}
              >
                {response.statusCode}
              </Badge>
              <ResponseSimulationBadge response={response} />
            </motion.div>
          </motion.div>
          {canActivateResponse && (
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label={editButtonTitle}
                        className="cursor-pointer bg-background/80 shadow-xs"
                        disabled={!isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        size="icon-sm"
                        type="button"
                        variant="outline"
                      >
                        <Pen />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent side="top">{editButtonTitle}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick("name");
                    }}
                  >
                    <TextCursor className="h-4 w-4" />
                    Edit Name
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick("statusCode");
                    }}
                  >
                    <Hash className="h-4 w-4" />
                    Edit Status Code
                  </DropdownMenuItem>
                  <DropdownMenuItem
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
                    className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    Delete Response
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={simulateButtonTitle}
                    className="cursor-pointer bg-background/80 shadow-xs"
                    disabled={!isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSimulateDialog(true);
                    }}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Timer />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {simulateButtonTitle}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={activationButtonTitle}
                    className={cn(
                      "cursor-pointer",
                      getActivationButtonClasses(isActive, isLoading)
                    )}
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDialog(true);
                    }}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    {isActive ? <CheckCircle2 /> : <Circle />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {activationButtonTitle}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.div>

      <SimulateTimeoutDialog
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
