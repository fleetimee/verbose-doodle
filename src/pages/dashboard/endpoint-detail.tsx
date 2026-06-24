import {
  ArrowLeft,
  Check,
  Circle,
  CircleHelp,
  Hash,
  List,
  Pen,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { type TourStep, useTour } from "@/components/tour";
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
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { EndpointDetailLayout } from "@/features/endpoints/components/endpoint-detail-layout";
import { EndpointDetailSkeleton } from "@/features/endpoints/components/endpoint-detail-skeleton";
import { EndpointTrafficLogViewer } from "@/features/endpoints/components/endpoint-traffic-log-viewer";
import { ResponseStepper } from "@/features/endpoints/components/response-stepper";
import { useActivateResponse } from "@/features/endpoints/hooks/use-activate-response";
import { useCreateResponse } from "@/features/endpoints/hooks/use-create-response";
import { useDeactivateResponse } from "@/features/endpoints/hooks/use-deactivate-response";
import { useDeleteEndpoint } from "@/features/endpoints/hooks/use-delete-endpoint";
import { useGetEndpoint } from "@/features/endpoints/hooks/use-get-endpoint";
import { useUpdateEndpoint } from "@/features/endpoints/hooks/use-update-endpoint";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
  getMethodTextColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";
import { decodeId } from "@/lib/id-encoder";

// Animation constants
const PAGE_ANIMATION_DURATION = 0.4;
const HEADER_TOGGLE_ANIMATION_DURATION = 0.18;
const STAGGER_DELAY = 0.1;
const HTTP_METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];
const ENDPOINT_DETAIL_TOUR_ID = "endpoint-detail-intro";
const ENDPOINT_DETAIL_TOUR_TARGETS = {
  header: "endpoint-detail-tour-header",
  editActions: "endpoint-detail-tour-edit-actions",
  addResponse: "endpoint-detail-tour-add-response",
  responses: "endpoint-detail-tour-responses",
  preview: "endpoint-detail-tour-preview",
  trafficLogs: "endpoint-detail-tour-traffic-logs",
} as const;

function TourStepContent({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="flex flex-col gap-2 pr-10">
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function EndpointDetailPage() {
  const { id: encodedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });
  const canAddResponse = can("canAddResponse");

  // Decode the ID from the URL
  const decodedId = useMemo(() => {
    if (!encodedId) {
      return null;
    }
    return decodeId(encodedId);
  }, [encodedId]);

  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState("");
  const [editedMethod, setEditedMethod] = useState<HttpMethod>("GET");
  const [showDeleteEndpointDialog, setShowDeleteEndpointDialog] =
    useState(false);
  const [hasSeenEndpointDetailTour, setHasSeenEndpointDetailTour] =
    useLocalStorage("endpoint-detail-tour-seen", false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();

  const { data: endpoint, isPending: isLoadingEndpoint } = useGetEndpoint(
    decodedId ?? ""
  );
  const { mutate: createResponse, isPending: isCreatingResponse } =
    useCreateResponse();
  const { mutate: activateResponse, isPending: isActivatingResponse } =
    useActivateResponse();
  const { mutate: deactivateResponse, isPending: isDeactivatingResponse } =
    useDeactivateResponse();
  const { mutate: updateEndpoint, isPending: isUpdatingEndpoint } =
    useUpdateEndpoint();
  const { mutate: deleteEndpoint, isPending: isDeletingEndpoint } =
    useDeleteEndpoint();

  useDocumentMeta({
    title: endpoint ? `${endpoint.method} ${endpoint.url}` : "Endpoint Detail",
    description: "View and manage endpoint responses",
  });

  const selectedResponse = useMemo(() => {
    if (!(endpoint && selectedResponseId)) {
      return null;
    }
    return endpoint.responses.find((r) => r.id === selectedResponseId) ?? null;
  }, [endpoint, selectedResponseId]);

  const tourSteps = useMemo<TourStep[]>(() => {
    if (!endpoint) {
      return [];
    }

    return [
      {
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.header,
        position: "bottom",
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.headerDescription}
            title={messages.endpoints.detailTour.headerTitle}
          />
        ),
      },
      ...(can("canEditEndpoint")
        ? [
            {
              selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.editActions,
              position: "bottom" as const,
              content: (
                <TourStepContent
                  description={
                    messages.endpoints.detailTour.editActionsDescription
                  }
                  title={messages.endpoints.detailTour.editActionsTitle}
                />
              ),
            },
          ]
        : []),
      ...(canAddResponse
        ? [
            {
              selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.addResponse,
              position: "left" as const,
              content: (
                <TourStepContent
                  description={
                    messages.endpoints.detailTour.addResponseDescription
                  }
                  title={messages.endpoints.detailTour.addResponseTitle}
                />
              ),
            },
          ]
        : []),
      {
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.responses,
        position: "right",
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.responsesDescription}
            title={messages.endpoints.detailTour.responsesTitle}
          />
        ),
      },
      {
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.preview,
        position: "left",
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.previewDescription}
            title={messages.endpoints.detailTour.previewTitle}
          />
        ),
      },
      {
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.trafficLogs,
        position: "top",
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.trafficLogsDescription}
            title={messages.endpoints.detailTour.trafficLogsTitle}
          />
        ),
      },
    ];
  }, [can, canAddResponse, endpoint]);

  const handleStartTour = useCallback(() => {
    setSteps(tourSteps);
    startTour(ENDPOINT_DETAIL_TOUR_ID);
  }, [setSteps, startTour, tourSteps]);

  useEffect(() => {
    if (
      isLoadingEndpoint ||
      !endpoint ||
      hasSeenEndpointDetailTour ||
      hasAutoStartedTour.current ||
      tourSteps.length === 0
    ) {
      return;
    }

    hasAutoStartedTour.current = true;

    const timeoutId = window.setTimeout(() => {
      shouldMarkTourSeenOnEnd.current = true;
      handleStartTour();
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [
    endpoint,
    handleStartTour,
    hasSeenEndpointDetailTour,
    isLoadingEndpoint,
    tourSteps.length,
  ]);

  useEffect(() => {
    if (
      shouldMarkTourSeenOnEnd.current &&
      activeTourId === ENDPOINT_DETAIL_TOUR_ID &&
      !isActive
    ) {
      shouldMarkTourSeenOnEnd.current = false;
      setHasSeenEndpointDetailTour(true);
    }
  }, [activeTourId, isActive, setHasSeenEndpointDetailTour]);

  const handleBack = () => {
    navigate("/dashboard/endpoints");
  };

  const handleAddResponse = (data: ResponseFormData) => {
    if (!endpoint) {
      return;
    }

    createResponse(
      {
        endpointId: endpoint.id,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Response created successfully");
          setIsStepperOpen(false);
        },
        onError: () => {
          toast.error("Failed to create response");
        },
      }
    );
  };

  const handleActivateResponse = (response: EndpointResponse) => {
    if (!endpoint) {
      return;
    }

    activateResponse(
      {
        endpointId: endpoint.id,
        responseId: response.id,
      },
      {
        onSuccess: () => {
          toast.success(`Response "${response.name}" activated`);
        },
        onError: () => {
          toast.error("Failed to activate response");
        },
      }
    );
  };

  const handleDeactivateResponse = (response: EndpointResponse) => {
    if (!endpoint) {
      return;
    }

    deactivateResponse(
      {
        endpointId: endpoint.id,
        responseId: response.id,
      },
      {
        onSuccess: () => {
          toast.success(`Response "${response.name}" deactivated`);
        },
        onError: () => {
          toast.error("Failed to deactivate response");
        },
      }
    );
  };

  const handleEditUrl = () => {
    if (!endpoint) {
      return;
    }
    setEditedUrl(endpoint.url);
    setEditedMethod(endpoint.method);
    setIsEditingUrl(true);
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleCancelEdit = () => {
    setIsEditingUrl(false);
    setEditedUrl("");
    setEditedMethod("GET");
  };

  const handleSaveUrl = () => {
    if (!(endpoint && editedUrl.trim())) {
      return;
    }

    // Don't update if nothing changed
    if (editedUrl === endpoint.url && editedMethod === endpoint.method) {
      setIsEditingUrl(false);
      return;
    }

    // Build update payload - only include changed fields
    const updatePayload: {
      endpointId: string;
      url?: string;
      method?: string;
    } = {
      endpointId: endpoint.id,
    };

    if (editedUrl.trim() !== endpoint.url) {
      updatePayload.url = editedUrl.trim();
    }

    if (editedMethod !== endpoint.method) {
      updatePayload.method = editedMethod;
    }

    updateEndpoint(updatePayload, {
      onSuccess: () => {
        setIsEditingUrl(false);
        setEditedUrl("");
        setEditedMethod("GET");
      },
      onError: () => {
        // Error toast is handled by the hook
        // Keep editing mode open so user can correct the error
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveUrl();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDeleteEndpointClick = () => {
    setShowDeleteEndpointDialog(true);
  };

  const handleConfirmDeleteEndpoint = () => {
    if (!endpoint) {
      return;
    }

    deleteEndpoint(
      {
        endpointId: endpoint.id,
      },
      {
        onSuccess: () => {
          setShowDeleteEndpointDialog(false);
          // Redirect to endpoints page after deletion
          navigate("/dashboard/endpoints");
        },
      }
    );
  };

  // Show error if the ID cannot be decoded
  if (!decodedId) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Endpoints
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
          <Empty className="min-h-[60vh] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Circle />
              </EmptyMedia>
              <EmptyTitle>Invalid endpoint ID</EmptyTitle>
              <EmptyDescription>
                The endpoint URL is invalid or has been tampered with.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleBack}>Back to Endpoints</Button>
            </EmptyContent>
          </Empty>
        </motion.div>
      </motion.div>
    );
  }

  if (isLoadingEndpoint) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <div className="flex items-start gap-3 md:items-center md:gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
                <Skeleton className="h-6 w-48 rounded-md md:h-8 md:w-64" />
              </div>
              <Skeleton className="h-4 w-full max-w-sm rounded-md" />
            </div>
          </div>
          {canAddResponse && (
            <Skeleton className="h-10 w-32 shrink-0 rounded-md" />
          )}
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
          <EndpointDetailSkeleton />
        </motion.div>
      </motion.div>
    );
  }

  if (!endpoint) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Endpoints
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY * 2,
            ease: "easeOut",
          }}
        >
          <Empty className="min-h-[60vh] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Circle />
              </EmptyMedia>
              <EmptyTitle>Endpoint not found</EmptyTitle>
              <EmptyDescription>
                The endpoint you're looking for doesn't exist or has been
                removed.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleBack}>Back to Endpoints</Button>
            </EmptyContent>
          </Empty>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: PAGE_ANIMATION_DURATION, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        id={ENDPOINT_DETAIL_TOUR_TARGETS.header}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY,
          ease: "easeOut",
        }}
      >
        <div className="flex items-start gap-3 md:items-center md:gap-4">
          <Button
            aria-label="Back to Endpoints"
            className="mt-1 bg-background/80 shadow-xs md:mt-0"
            onClick={handleBack}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <AnimatePresence initial={false} mode="wait">
                {isEditingUrl ? (
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex w-full flex-wrap items-center gap-2"
                    exit={{ opacity: 0, scale: 0.98, y: -6 }}
                    initial={{ opacity: 0, scale: 0.98, y: 6 }}
                    key="endpoint-edit"
                    layout
                    transition={{
                      duration: HEADER_TOGGLE_ANIMATION_DURATION,
                      ease: "easeOut",
                    }}
                  >
                    <Select
                      disabled={isUpdatingEndpoint}
                      onValueChange={(value) =>
                        setEditedMethod(value as HttpMethod)
                      }
                      value={editedMethod}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SelectTrigger
                            className={`h-auto w-auto gap-1 rounded-md px-2 py-1 font-mono font-semibold text-xs shadow-none focus:ring-0 focus-visible:ring-0 ${getMethodBadgeColor(
                              editedMethod
                            )}`}
                          >
                            <SelectValue>
                              <span
                                className={getMethodTextColor(editedMethod)}
                              >
                                {editedMethod}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {messages.endpoints.methodTooltip[editedMethod]}
                        </TooltipContent>
                      </Tooltip>
                      <SelectContent>
                        {HTTP_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={getMethodTextColor(method)}>
                                  {method}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="z-[60]" side="right">
                                {messages.endpoints.methodTooltip[method]}
                              </TooltipContent>
                            </Tooltip>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-auto min-w-[260px] flex-1 rounded-none border-0 bg-transparent px-0 py-0 font-bold font-mono text-xl tracking-tight shadow-none focus-visible:ring-0 md:text-2xl"
                      disabled={isUpdatingEndpoint}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={inputRef}
                      value={editedUrl}
                    />
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label={messages.endpoints.saveEndpointTooltip}
                            className="border-green-600/40 bg-green-50 text-green-700 shadow-xs hover:bg-green-100 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
                            disabled={isUpdatingEndpoint || !editedUrl.trim()}
                            onClick={handleSaveUrl}
                            size="icon-sm"
                            type="button"
                            variant="outline"
                          >
                            <Check />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {messages.endpoints.saveEndpointTooltip}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label={
                              messages.endpoints.cancelEndpointEditTooltip
                            }
                            className="border-destructive/40 bg-destructive/10 text-destructive shadow-xs hover:bg-destructive/15 hover:text-destructive"
                            disabled={isUpdatingEndpoint}
                            onClick={handleCancelEdit}
                            size="icon-sm"
                            type="button"
                            variant="outline"
                          >
                            <X />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {messages.endpoints.cancelEndpointEditTooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-2 md:gap-3"
                    exit={{ opacity: 0, scale: 0.98, y: -6 }}
                    initial={{ opacity: 0, scale: 0.98, y: 6 }}
                    key="endpoint-display"
                    layout
                    transition={{
                      duration: HEADER_TOGGLE_ANIMATION_DURATION,
                      ease: "easeOut",
                    }}
                  >
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
                        endpoint.method
                      )}`}
                    >
                      {abbreviateMethod(endpoint.method)}
                    </span>
                    <h1 className="break-all font-bold font-mono text-xl tracking-tight md:text-2xl">
                      {endpoint.url}
                    </h1>
                    <ProtectedAction ability="canEditEndpoint">
                      <div
                        className="flex items-center gap-1"
                        id={ENDPOINT_DETAIL_TOUR_TARGETS.editActions}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-label={
                                messages.endpoints.editEndpointTooltip
                              }
                              className="bg-background/80 shadow-xs"
                              onClick={handleEditUrl}
                              size="icon-sm"
                              type="button"
                              variant="outline"
                            >
                              <Pen />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {messages.endpoints.editEndpointTooltip}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-label={
                                messages.endpoints.deleteEndpointTooltip
                              }
                              className="border-destructive/40 bg-background/80 text-destructive shadow-xs hover:bg-destructive/10 hover:text-destructive"
                              onClick={handleDeleteEndpointClick}
                              size="icon-sm"
                              type="button"
                              variant="outline"
                            >
                              <Trash2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {messages.endpoints.deleteEndpointTooltip}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </ProtectedAction>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>Biller ID</span>
                <span className="font-mono text-foreground">
                  {endpoint.billerId}
                </span>
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
                <List className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-foreground">
                  {endpoint.responses.length}
                </span>
                <span>
                  response{endpoint.responses.length === 1 ? "" : "s"}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleStartTour}
            size="sm"
            type="button"
            variant="outline"
          >
            <CircleHelp data-icon="inline-start" />
            {messages.endpoints.tour.startButton}
          </Button>
          <ProtectedAction ability="canAddResponse">
            <Button
              id={ENDPOINT_DETAIL_TOUR_TARGETS.addResponse}
              onClick={() => setIsStepperOpen(true)}
              size="sm"
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Response
            </Button>
          </ProtectedAction>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY * 2,
          ease: "easeOut",
        }}
      >
        <EndpointDetailLayout
          endpointMethod={endpoint.method}
          endpointUrl={endpoint.url}
          isActivating={isActivatingResponse}
          isDeactivating={isDeactivatingResponse}
          onActivateResponse={handleActivateResponse}
          onDeactivateResponse={handleDeactivateResponse}
          onSelectResponse={setSelectedResponseId}
          previewTourId={ENDPOINT_DETAIL_TOUR_TARGETS.preview}
          responses={endpoint.responses}
          responsesTourId={ENDPOINT_DETAIL_TOUR_TARGETS.responses}
          selectedResponse={selectedResponse}
          selectedResponseId={selectedResponseId}
        />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY * 3,
          ease: "easeOut",
        }}
      >
        <EndpointTrafficLogViewer
          endpointId={endpoint.id}
          hasActiveResponse={endpoint.responses.some(
            (response) => response.activated
          )}
          responseCount={endpoint.responses.length}
          tourId={ENDPOINT_DETAIL_TOUR_TARGETS.trafficLogs}
        />
      </motion.div>

      <AnimatePresence>
        {isStepperOpen && (
          <ResponseStepper
            isSubmitting={isCreatingResponse}
            onCancel={() => setIsStepperOpen(false)}
            onSubmit={handleAddResponse}
          />
        )}
      </AnimatePresence>

      <AlertDialog
        onOpenChange={setShowDeleteEndpointDialog}
        open={showDeleteEndpointDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this endpoint{" "}
              <span className="font-semibold">
                {endpoint?.method} {endpoint?.url}
              </span>
              ? This action cannot be undone and will permanently remove:
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>The endpoint configuration</li>
                <li>
                  All {endpoint?.responses.length || 0} response
                  {endpoint?.responses.length === 1 ? "" : "s"} associated with
                  this endpoint
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEndpoint}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeletingEndpoint}
              onClick={handleConfirmDeleteEndpoint}
            >
              {isDeletingEndpoint ? "Deleting..." : "Delete Endpoint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
