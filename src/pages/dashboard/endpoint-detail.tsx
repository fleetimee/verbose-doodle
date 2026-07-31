import {
  Add01Icon,
  ArrowLeft02Icon,
  BarChartIcon,
  Cancel01Icon,
  CircleIcon as CircleDefinition,
  Delete02Icon,
  HashIcon,
  HelpCircleIcon,
  Menu01Icon,
  Pen01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
import { useDashboardNavigation } from "@/features/dashboard/dashboard-navigation-context";
import { EndpointDetailLayout } from "@/features/endpoints/components/endpoint-detail-layout";
import { EndpointDetailSkeleton } from "@/features/endpoints/components/endpoint-detail-skeleton";
import { EndpointMetricsSheet } from "@/features/endpoints/components/endpoint-metrics-sheet";
import { EndpointTrafficLogViewer } from "@/features/endpoints/components/endpoint-traffic-log-viewer";
import { ResponseStepper } from "@/features/endpoints/components/response-stepper";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import type {
  Endpoint,
  EndpointResponse,
  HttpMethod,
} from "@/features/endpoints/types";
import {
  getActiveResponses,
  selectActiveResponse,
} from "@/features/endpoints/utils/endpoint-selection";
import {
  abbreviateMethod,
  getMethodBadgeColor,
  getMethodTextColor,
} from "@/features/endpoints/utils/http-method-colors";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";
import { decodeId } from "@/lib/id-encoder";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

// Animation constants
const PAGE_ANIMATION_DURATION = 0.4;
const HEADER_TOGGLE_ANIMATION_DURATION = 0.18;
const STAGGER_DELAY = 0.1;
const ENDPOINT_SWITCH_DURATION = MOTION_DURATION.press;
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

function getHistoryIndex() {
  const index = window.history.state?.idx;
  return typeof index === "number" ? index : null;
}

function getCurrentHistoryPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This page coordinates the endpoint workspace state machine and its guarded overlays.
export function EndpointDetailPage() {
  const { id: encodedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const {
    forgetEndpoint,
    navigateToEndpoint,
    rememberEndpoint,
    registerEndpointNavigationGuard,
    requestEndpointNavigation: requestDashboardEndpointNavigation,
  } = useDashboardNavigation();
  const location = useLocation();
  const canAddResponse = session.can("canAddResponse");
  const canEditEndpoint = session.can("canEditEndpoint");
  const shouldReduceMotion = useReducedMotion() ?? false;

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
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState("");
  const [editedMethod, setEditedMethod] = useState<HttpMethod>("GET");
  const [isAddResponseDirty, setIsAddResponseDirty] = useState(false);
  const [isResponseEditDirty, setIsResponseEditDirty] = useState(false);
  const [showDiscardChangesDialog, setShowDiscardChangesDialog] =
    useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);
  const [showDeleteEndpointDialog, setShowDeleteEndpointDialog] =
    useState(false);
  const [hasSeenEndpointDetailTour, setHasSeenEndpointDetailTour] =
    useLocalStorage("endpoint-detail-tour-seen", false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const previousEndpointIdRef = useRef<string | null>(null);
  const selectedResponseWasActiveRef = useRef(false);
  const reportedMultipleActiveRef = useRef<string | null>(null);
  const reportedRefreshErrorRef = useRef<string | null>(null);
  const currentHistoryIndexRef = useRef<number | null>(getHistoryIndex());
  const pendingHistoryDeltaRef = useRef<number | null>(null);
  const allowHistoryNavigationRef = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();

  const {
    endpoint: endpointQuery,
    createResponse: createResponseMutation,
    activateResponse: activateResponseMutation,
    deactivateResponse: deactivateResponseMutation,
  } = useEndpointWorkspace(decodedId ?? "");
  const {
    data: endpoint,
    error: endpointError,
    isError: hasEndpointError,
    isFetching: isFetchingEndpoint,
    isPending: isLoadingEndpoint,
  } = endpointQuery;
  const { mutate: createResponse, isPending: isCreatingResponse } =
    createResponseMutation;
  const { mutate: activateResponse, isPending: isActivatingResponse } =
    activateResponseMutation;
  const { mutate: deactivateResponse, isPending: isDeactivatingResponse } =
    deactivateResponseMutation;
  const {
    updateEndpoint: updateEndpointMutation,
    deleteEndpoint: deleteEndpointMutation,
  } = useEndpointCatalog();
  const { mutate: updateEndpoint, isPending: isUpdatingEndpoint } =
    updateEndpointMutation;
  const { mutate: deleteEndpoint, isPending: isDeletingEndpoint } =
    deleteEndpointMutation;

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

  const isDirtyEndpointEdit = Boolean(
    endpoint &&
      isEditingUrl &&
      (editedUrl !== endpoint.url || editedMethod !== endpoint.method)
  );
  const hasDirtyEndpointForm =
    isDirtyEndpointEdit || isAddResponseDirty || isResponseEditDirty;

  const closeEndpointScopedOverlays = useCallback(() => {
    setIsStepperOpen(false);
    setIsMetricsOpen(false);
    setShowDeleteEndpointDialog(false);
    setIsEditingUrl(false);
    setEditedUrl("");
    setEditedMethod("GET");
    setIsAddResponseDirty(false);
    setIsResponseEditDirty(false);
  }, []);

  const prepareEndpointNavigation = useCallback(
    (path: string) => {
      if (hasDirtyEndpointForm) {
        setPendingNavigationPath(path);
        setShowDiscardChangesDialog(true);
        return false;
      }

      closeEndpointScopedOverlays();
      return true;
    },
    [closeEndpointScopedOverlays, hasDirtyEndpointForm]
  );

  useEffect(
    () => registerEndpointNavigationGuard(prepareEndpointNavigation),
    [prepareEndpointNavigation, registerEndpointNavigationGuard]
  );

  useEffect(() => {
    currentHistoryIndexRef.current = getHistoryIndex();
  }, [location.key]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const nextHistoryIndex = getHistoryIndex();
      const currentHistoryIndex = currentHistoryIndexRef.current;

      if (allowHistoryNavigationRef.current) {
        allowHistoryNavigationRef.current = false;
        currentHistoryIndexRef.current = nextHistoryIndex;
        return;
      }

      if (
        currentHistoryIndex === null ||
        nextHistoryIndex === null ||
        currentHistoryIndex === nextHistoryIndex
      ) {
        currentHistoryIndexRef.current = nextHistoryIndex;
        return;
      }

      if (prepareEndpointNavigation(getCurrentHistoryPath())) {
        currentHistoryIndexRef.current = nextHistoryIndex;
        return;
      }

      const delta = nextHistoryIndex - currentHistoryIndex;
      pendingHistoryDeltaRef.current = delta;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.history.go(-delta);
    };

    window.addEventListener("popstate", handlePopState, true);
    return () => window.removeEventListener("popstate", handlePopState, true);
  }, [prepareEndpointNavigation]);

  useEffect(() => {
    if (!endpoint) {
      return;
    }

    const activeResponses = getActiveResponses(endpoint);
    const endpointChanged = previousEndpointIdRef.current !== endpoint.id;

    if (endpointChanged) {
      previousEndpointIdRef.current = endpoint.id;
      rememberEndpoint({
        billerSlug: endpoint.billerSlug,
        endpointId: endpoint.id,
      });
      closeEndpointScopedOverlays();
      const nextResponse = selectActiveResponse(endpoint);
      selectedResponseWasActiveRef.current = nextResponse !== null;
      setSelectedResponseId(nextResponse?.id ?? null);
    } else if (
      selectedResponseWasActiveRef.current &&
      selectedResponse &&
      !selectedResponse.activated
    ) {
      const nextResponse = selectActiveResponse(endpoint);
      selectedResponseWasActiveRef.current = nextResponse !== null;
      setSelectedResponseId(nextResponse?.id ?? null);
    }

    if (activeResponses.length > 1) {
      const warningKey = `${endpoint.id}:${activeResponses
        .map((response) => response.id)
        .join(",")}`;
      if (reportedMultipleActiveRef.current !== warningKey) {
        reportedMultipleActiveRef.current = warningKey;
        toast.warning("Multiple active responses detected", {
          description:
            "The first active response is selected. Server data was not changed.",
        });
      }
    }
  }, [
    closeEndpointScopedOverlays,
    endpoint,
    rememberEndpoint,
    selectedResponse,
  ]);

  useEffect(() => {
    if (!(endpoint && hasEndpointError && endpointError)) {
      if (!hasEndpointError) {
        reportedRefreshErrorRef.current = null;
      }
      return;
    }

    const errorKey = `${endpoint.id}:${endpointError.message}`;
    if (reportedRefreshErrorRef.current === errorKey) {
      return;
    }

    reportedRefreshErrorRef.current = errorKey;
    toast.error("Failed to refresh endpoint", {
      description: endpointError.message,
    });
  }, [endpoint, endpointError, hasEndpointError]);

  useEffect(() => {
    if (
      endpointQuery.data !== null ||
      isLoadingEndpoint ||
      isFetchingEndpoint
    ) {
      return;
    }

    if (decodedId) {
      queryClient.removeQueries({
        queryKey: ["endpoint-data", "workspace", decodedId],
      });
      queryClient.setQueryData(
        ["endpoint-data", "catalog"],
        (catalog: Endpoint[] | undefined) =>
          catalog?.filter((candidate) => candidate.id !== decodedId)
      );
      forgetEndpoint(decodedId);
    }

    toast.error("Endpoint no longer exists");
    navigate("/dashboard/endpoints", { replace: true });
  }, [
    decodedId,
    endpointQuery.data,
    forgetEndpoint,
    isFetchingEndpoint,
    isLoadingEndpoint,
    navigate,
    queryClient,
  ]);

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
      ...(canEditEndpoint
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
  }, [canAddResponse, canEditEndpoint, endpoint]);

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
    requestDashboardEndpointNavigation("/dashboard/endpoints");
  };

  const handleSelectResponse = (responseId: string) => {
    const response = endpoint?.responses.find(
      (candidate) => candidate.id === responseId
    );
    selectedResponseWasActiveRef.current = response?.activated ?? false;
    setSelectedResponseId(responseId);
  };

  const handleDiscardChanges = () => {
    closeEndpointScopedOverlays();
    setPendingNavigationPath(null);
    setShowDiscardChangesDialog(false);

    const pendingHistoryDelta = pendingHistoryDeltaRef.current;
    if (pendingHistoryDelta !== null) {
      pendingHistoryDeltaRef.current = null;
      allowHistoryNavigationRef.current = true;
      window.history.go(pendingHistoryDelta);
      return;
    }

    if (pendingNavigationPath) {
      navigateToEndpoint(pendingNavigationPath);
    }
  };

  const handleKeepEditing = () => {
    pendingHistoryDeltaRef.current = null;
    setPendingNavigationPath(null);
    setShowDiscardChangesDialog(false);
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
          selectedResponseWasActiveRef.current = true;
          setSelectedResponseId(response.id);
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
          selectedResponseWasActiveRef.current = true;
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
      method?: HttpMethod;
    } = {
      endpointId: endpoint.id,
    };

    if (editedUrl.trim() !== endpoint.url) {
      updatePayload.url = editedUrl.trim();
    }

    if (editedMethod !== endpoint.method) {
      updatePayload.method = editedMethod;
    }

    updateEndpoint(
      {
        endpointId: updatePayload.endpointId,
        changes: {
          ...(updatePayload.url ? { url: updatePayload.url } : {}),
          ...(updatePayload.method ? { method: updatePayload.method } : {}),
        },
      },
      {
        onSuccess: () => {
          setIsEditingUrl(false);
          setEditedUrl("");
          setEditedMethod("GET");
        },
        onError: () => {
          // Error toast is handled by the hook
          // Keep editing mode open so user can correct the error
        },
      }
    );
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

    deleteEndpoint(endpoint.id, {
      onSuccess: () => {
        setShowDeleteEndpointDialog(false);
        // Redirect to endpoints page after deletion
        navigate("/dashboard/endpoints");
      },
    });
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
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={ArrowLeft02Icon}
              strokeWidth={2}
            />
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
                <HugeiconsIcon icon={CircleDefinition} strokeWidth={2} />
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
          className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
          initial={{ opacity: 0, y: 20 }}
          transition={{
            duration: PAGE_ANIMATION_DURATION,
            delay: STAGGER_DELAY,
            ease: "easeOut",
          }}
        >
          <div className="flex items-start gap-3 xl:items-center xl:gap-4">
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
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={ArrowLeft02Icon}
              strokeWidth={2}
            />
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
                <HugeiconsIcon icon={CircleDefinition} strokeWidth={2} />
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
        className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
        id={ENDPOINT_DETAIL_TOUR_TARGETS.header}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          duration: PAGE_ANIMATION_DURATION,
          delay: STAGGER_DELAY,
          ease: "easeOut",
        }}
      >
        <div className="flex items-start gap-3 xl:items-center xl:gap-4">
          <Button
            aria-label="Back to Endpoints"
            className="mt-1 bg-background/80 shadow-xs md:mt-0"
            onClick={handleBack}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              className="size-4"
              icon={ArrowLeft02Icon}
              strokeWidth={2}
            />
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
                      className="h-auto min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 font-bold font-mono text-xl tracking-tight shadow-none focus-visible:ring-0 lg:text-2xl"
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
                            <HugeiconsIcon
                              className="size-4"
                              icon={Tick02Icon}
                              strokeWidth={2}
                            />
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
                            <HugeiconsIcon
                              className="size-4"
                              icon={Cancel01Icon}
                              strokeWidth={2}
                            />
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
                    <motion.div
                      animate={{
                        opacity: 1,
                        y: shouldReduceMotion ? 0 : 0,
                      }}
                      className="flex flex-wrap items-center gap-2 md:gap-3"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                      key={`endpoint-identity-${endpoint.id}`}
                      transition={{
                        duration: ENDPOINT_SWITCH_DURATION,
                        ease: MOTION_EASE.out,
                      }}
                    >
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
                          endpoint.method
                        )}`}
                      >
                        {abbreviateMethod(endpoint.method)}
                      </span>
                      <h1 className="break-all font-bold font-mono text-xl tracking-tight lg:text-2xl">
                        {endpoint.url}
                      </h1>
                    </motion.div>
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
                              <HugeiconsIcon
                                className="size-4"
                                icon={Pen01Icon}
                                strokeWidth={2}
                              />
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
                              <HugeiconsIcon
                                className="size-4"
                                icon={Delete02Icon}
                                strokeWidth={2}
                              />
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
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
              key={`endpoint-meta-${endpoint.id}`}
              transition={{
                duration: ENDPOINT_SWITCH_DURATION,
                ease: MOTION_EASE.out,
              }}
            >
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
                <HugeiconsIcon
                  className="size-3.5 text-primary"
                  icon={HashIcon}
                  strokeWidth={2}
                />
                <span>Biller</span>
                <span className="font-mono text-foreground">
                  {endpoint.billerSlug}
                </span>
              </span>
              <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
                <HugeiconsIcon
                  className="size-3.5 text-primary"
                  icon={Menu01Icon}
                  strokeWidth={2}
                />
                <span className="font-mono text-foreground">
                  {endpoint.responses.length}
                </span>
                <span>
                  response{endpoint.responses.length === 1 ? "" : "s"}
                </span>
              </span>
            </motion.div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto">
          <Button
            onClick={() => setIsMetricsOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              data-icon="inline-start"
              icon={BarChartIcon}
              strokeWidth={2}
            />
            {messages.endpoints.metrics.button}
          </Button>
          <Button
            onClick={handleStartTour}
            size="sm"
            type="button"
            variant="outline"
          >
            <HugeiconsIcon
              data-icon="inline-start"
              icon={HelpCircleIcon}
              strokeWidth={2}
            />
            {messages.endpoints.tour.startButton}
          </Button>
          <ProtectedAction ability="canAddResponse">
            <Button
              id={ENDPOINT_DETAIL_TOUR_TARGETS.addResponse}
              onClick={() => setIsStepperOpen(true)}
              size="sm"
              type="button"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={Add01Icon}
                strokeWidth={2}
              />
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
          endpointId={endpoint.id}
          endpointMethod={endpoint.method}
          endpointUrl={endpoint.url}
          isActivating={isActivatingResponse}
          isDeactivating={isDeactivatingResponse}
          onActivateResponse={handleActivateResponse}
          onDeactivateResponse={handleDeactivateResponse}
          onEditResponseDirtyChange={setIsResponseEditDirty}
          onSelectResponse={handleSelectResponse}
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
            onDirtyChange={setIsAddResponseDirty}
            onSubmit={handleAddResponse}
          />
        )}
      </AnimatePresence>

      <EndpointMetricsSheet
        endpointId={endpoint.id}
        endpointLabel={`${endpoint.method} ${endpoint.url}`}
        onOpenChange={setIsMetricsOpen}
        open={isMetricsOpen}
      />

      <AlertDialog
        onOpenChange={setShowDiscardChangesDialog}
        open={showDiscardChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your endpoint changes will be lost if you switch workspaces now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepEditing}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              Discard and switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
