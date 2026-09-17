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
import { useI18n } from "@/components/i18n-provider";
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
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Switch } from "@/components/ui/switch";
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
import { formatMessage } from "@/lib/i18n";
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
  addResponse: "endpoint-detail-tour-add-response",
  editActions: "endpoint-detail-tour-edit-actions",
  header: "endpoint-detail-tour-header",
  preview: "endpoint-detail-tour-preview",
  responses: "endpoint-detail-tour-responses",
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
  const { messages } = useI18n();
  const { slug: endpointSlug } = useParams<{ slug: string }>();
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

  const routeEndpointSlug = endpointSlug ?? null;

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
  const previousEndpointSlugRef = useRef<string | null>(null);
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
  } = useEndpointWorkspace(routeEndpointSlug ?? "");
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
    description: messages.endpoints.detailDocumentDescription,
    title: endpoint
      ? `${endpoint.method} ${endpoint.url} | ${messages.endpoints.documentTitle}`
      : messages.endpoints.detailDocumentTitle,
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
    const endpointChanged = previousEndpointSlugRef.current !== endpoint.slug;

    if (endpointChanged) {
      previousEndpointSlugRef.current = endpoint.slug;
      rememberEndpoint({
        billerSlug: endpoint.billerSlug,
        endpointSlug: endpoint.slug,
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
        toast.warning(messages.endpoints.multipleActiveResponsesTitle, {
          description: messages.endpoints.multipleActiveResponsesDescription,
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
    toast.error(messages.endpoints.refreshFailed, {
      description: endpointError.message,
    });
  }, [endpoint, endpointError, hasEndpointError]);

  useEffect(() => {
    if (
      (endpointQuery.data !== null && endpointQuery.data !== undefined) ||
      isLoadingEndpoint ||
      isFetchingEndpoint
    ) {
      return;
    }

    if (routeEndpointSlug) {
      queryClient.removeQueries({
        queryKey: ["endpoint-data", "workspace", routeEndpointSlug],
      });
      queryClient.setQueryData(
        ["endpoint-data", "catalog"],
        (catalog: Endpoint[] | undefined) =>
          catalog?.filter((candidate) => candidate.slug !== routeEndpointSlug)
      );
      forgetEndpoint(routeEndpointSlug);
    }

    toast.error(messages.endpoints.endpointNoLongerExists);
    navigate("/dashboard/endpoints", { replace: true });
  }, [
    routeEndpointSlug,
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
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.headerDescription}
            title={messages.endpoints.detailTour.headerTitle}
          />
        ),
        position: "bottom",
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.header,
      },
      ...(canEditEndpoint
        ? [
            {
              content: (
                <TourStepContent
                  description={
                    messages.endpoints.detailTour.editActionsDescription
                  }
                  title={messages.endpoints.detailTour.editActionsTitle}
                />
              ),
              position: "bottom" as const,
              selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.editActions,
            },
          ]
        : []),
      ...(canAddResponse
        ? [
            {
              content: (
                <TourStepContent
                  description={
                    messages.endpoints.detailTour.addResponseDescription
                  }
                  title={messages.endpoints.detailTour.addResponseTitle}
                />
              ),
              position: "left" as const,
              selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.addResponse,
            },
          ]
        : []),
      {
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.responsesDescription}
            title={messages.endpoints.detailTour.responsesTitle}
          />
        ),
        position: "right",
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.responses,
      },
      {
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.previewDescription}
            title={messages.endpoints.detailTour.previewTitle}
          />
        ),
        position: "left",
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.preview,
      },
      {
        content: (
          <TourStepContent
            description={messages.endpoints.detailTour.trafficLogsDescription}
            title={messages.endpoints.detailTour.trafficLogsTitle}
          />
        ),
        position: "top",
        selectorId: ENDPOINT_DETAIL_TOUR_TARGETS.trafficLogs,
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
          setIsStepperOpen(false);
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
          toast.success(
            formatMessage(messages.endpoints.responseActivatedToast, {
              name: response.name,
            })
          );
          selectedResponseWasActiveRef.current = true;
          setSelectedResponseId(response.id);
        },
      }
    );
  };

  const handleCloneResponse = (response: EndpointResponse) => {
    selectedResponseWasActiveRef.current = false;
    setSelectedResponseId(response.id);
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
          toast.success(
            formatMessage(messages.endpoints.responseDeactivatedToast, {
              name: response.name,
            })
          );
          selectedResponseWasActiveRef.current = true;
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
      endpointSlug: string;
      url?: string;
      method?: HttpMethod;
    } = {
      endpointSlug: endpoint.slug,
    };

    if (editedUrl.trim() !== endpoint.url) {
      updatePayload.url = editedUrl.trim();
    }

    if (editedMethod !== endpoint.method) {
      updatePayload.method = editedMethod;
    }

    const changes: { url?: string; method?: HttpMethod } = {};
    if (updatePayload.url) {
      changes.url = updatePayload.url;
    }
    if (updatePayload.method) {
      changes.method = updatePayload.method;
    }

    updateEndpoint(
      {
        changes,
        endpointSlug: updatePayload.endpointSlug,
      },
      {
        onError: () => {
          // Error toast is handled by the hook
          // Keep editing mode open so user can correct the error
        },
        onSuccess: () => {
          setIsEditingUrl(false);
          setEditedUrl("");
          setEditedMethod("GET");
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

  const handleEndpointEnabledChange = (enabled: boolean) => {
    if (!endpoint) {
      return;
    }

    updateEndpoint({
      changes: { enabled },
      endpointSlug: endpoint.slug,
    });
  };

  const handleConfirmDeleteEndpoint = () => {
    if (!endpoint) {
      return;
    }

    deleteEndpoint(endpoint.slug, {
      onSuccess: () => {
        setShowDeleteEndpointDialog(false);
        // Redirect to endpoints page after deletion
        navigate("/dashboard/endpoints");
      },
    });
  };

  // Show an error if the endpoint route parameter is missing
  if (!routeEndpointSlug) {
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
            delay: STAGGER_DELAY,
            duration: PAGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={ArrowLeft02Icon}
              strokeWidth={2}
            />
            {messages.endpoints.backToEndpoints}
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            delay: STAGGER_DELAY * 2,
            duration: PAGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <Empty className="min-h-[60vh]" variant="bordered">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={CircleDefinition} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>{messages.endpoints.invalidEndpointSlug}</EmptyTitle>
              <EmptyDescription>
                {messages.endpoints.invalidEndpointSlugDescription}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleBack}>
                {messages.endpoints.backToEndpoints}
              </Button>
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
            delay: STAGGER_DELAY,
            duration: PAGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <div className="flex items-start gap-3 xl:items-center xl:gap-4">
            <Skeleton className="size-10 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Skeleton className="h-6 w-16 shrink-0" />
                <Skeleton className="h-6 w-48 md:h-8 md:w-64" />
              </div>
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          </div>
          {canAddResponse && <Skeleton className="h-10 w-32 shrink-0" />}
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            delay: STAGGER_DELAY * 2,
            duration: PAGE_ANIMATION_DURATION,
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
            delay: STAGGER_DELAY,
            duration: PAGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <Button onClick={handleBack} size="sm" variant="ghost">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={ArrowLeft02Icon}
              strokeWidth={2}
            />
            {messages.endpoints.backToEndpoints}
          </Button>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{
            delay: STAGGER_DELAY * 2,
            duration: PAGE_ANIMATION_DURATION,
            ease: "easeOut",
          }}
        >
          <Empty className="min-h-[60vh]" variant="bordered">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={CircleDefinition} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>{messages.endpoints.endpointNotFound}</EmptyTitle>
              <EmptyDescription>
                {messages.endpoints.endpointNotFoundDescription}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleBack}>
                {messages.endpoints.backToEndpoints}
              </Button>
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
        className="@container flex min-w-0 flex-col gap-4"
        id={ENDPOINT_DETAIL_TOUR_TARGETS.header}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          delay: STAGGER_DELAY,
          duration: PAGE_ANIMATION_DURATION,
          ease: "easeOut",
        }}
      >
        <div className="flex min-w-0 items-start gap-3">
          <Button
            aria-label={messages.endpoints.backToEndpoints}
            className="shrink-0"
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
                            className="w-auto"
                            size="badge"
                            variant={
                              `method-${editedMethod.toLowerCase()}` as
                                | "method-get"
                                | "method-post"
                                | "method-put"
                                | "method-delete"
                                | "method-patch"
                            }
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
                      className="min-w-0 flex-1"
                      disabled={isUpdatingEndpoint}
                      onChange={(e) => setEditedUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={inputRef}
                      value={editedUrl}
                      variant="ghost-title"
                    />
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label={messages.endpoints.saveEndpointTooltip}
                            disabled={isUpdatingEndpoint || !editedUrl.trim()}
                            onClick={handleSaveUrl}
                            size="icon-sm"
                            type="button"
                            variant="success"
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
                            disabled={isUpdatingEndpoint}
                            onClick={handleCancelEdit}
                            size="icon-sm"
                            type="button"
                            variant="destructive-subtle"
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
                    className="flex w-full min-w-0 flex-col items-start gap-3"
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
                      className="flex w-full min-w-0 items-start gap-2 md:gap-3"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                      key={`endpoint-identity-${endpoint.id}`}
                      transition={{
                        duration: ENDPOINT_SWITCH_DURATION,
                        ease: MOTION_EASE.out,
                      }}
                    >
                      <span
                        className={`mt-1 shrink-0 select-none rounded-md border px-2 py-0.5 font-mono font-semibold text-xs ${getMethodBadgeColor(
                          endpoint.method
                        )}`}
                      >
                        {abbreviateMethod(endpoint.method)}
                      </span>
                      <h1 className="min-w-0 break-all font-mono font-semibold text-lg leading-relaxed tracking-tight sm:text-xl lg:text-2xl">
                        {endpoint.url}
                      </h1>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
              key={`endpoint-meta-${endpoint.id}`}
              transition={{
                duration: ENDPOINT_SWITCH_DURATION,
                ease: MOTION_EASE.out,
              }}
            >
              <span className="inline-flex min-w-0 max-w-full items-start gap-1.5 text-muted-foreground text-xs leading-5">
                <HugeiconsIcon
                  className="mt-0.5 size-3.5 shrink-0"
                  icon={HashIcon}
                  strokeWidth={2}
                />
                <span className="text-muted-foreground/80">
                  {messages.endpoints.billerLabel}
                </span>
                <span className="min-w-0 break-all font-mono text-foreground">
                  {endpoint.billerSlug}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs">
                <HugeiconsIcon
                  className="size-3.5 text-primary"
                  icon={Menu01Icon}
                  strokeWidth={2}
                />
                <span className="font-mono text-foreground">
                  {endpoint.responses.length}
                </span>
                <span>
                  {formatMessage(messages.endpoints.responseCount, {
                    count: endpoint.responses.length,
                  })}
                </span>
              </span>
            </motion.div>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-border/70 border-t pt-3 [&_button[data-slot=button]]:h-8 [&_button[data-slot=button]]:text-xs [&_button[data-slot=button]]:shadow-none [&_button[data-slot=button]]:active:scale-100 [@media(any-pointer:coarse)]:[&_button[data-slot=button]]:min-h-11 [@media(any-pointer:coarse)]:[&_button[data-slot=button]]:min-w-11">
          {!isEditingUrl && (
            <ProtectedAction ability="canEditEndpoint">
              <ButtonGroup
                aria-label={messages.endpoints.detailTour.editActionsTitle}
                className="max-w-full"
                id={ENDPOINT_DETAIL_TOUR_TARGETS.editActions}
                variant="muted"
              >
                <label
                  className="flex min-h-8 cursor-pointer items-center gap-2 border-border/70 border-r px-2.5 text-xs transition-colors focus-within:bg-accent focus-within:ring-2 focus-within:ring-ring/50 active:bg-accent/80 has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50 motion-reduce:transition-none [@media(any-hover:hover)]:hover:bg-accent [@media(any-pointer:coarse)]:min-h-11"
                  htmlFor="endpoint-enabled"
                >
                  <Switch
                    aria-labelledby="endpoint-enabled-label"
                    checked={endpoint.enabled !== false}
                    disabled={isUpdatingEndpoint}
                    id="endpoint-enabled"
                    onCheckedChange={handleEndpointEnabledChange}
                  />
                  <span id="endpoint-enabled-label">
                    {endpoint.enabled === false
                      ? messages.common.disabled
                      : messages.common.enabled}
                  </span>
                </label>
                <Button
                  aria-label={messages.endpoints.editEndpointTooltip}
                  className="min-w-8"
                  onClick={handleEditUrl}
                  size="sm"
                  type="button"
                  variant="ghost-muted"
                >
                  <HugeiconsIcon icon={Pen01Icon} strokeWidth={2} />
                  <span className="@sm:inline hidden">
                    {messages.endpoints.editEndpointMenuItem}
                  </span>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={messages.endpoints.deleteEndpointTooltip}
                      onClick={handleDeleteEndpointClick}
                      size="icon-sm"
                      type="button"
                      variant="ghost-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {messages.endpoints.deleteEndpointTooltip}
                  </TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </ProtectedAction>
          )}
          <div className="ml-auto flex min-w-0 flex-wrap items-center gap-1">
            <Button
              onClick={() => setIsMetricsOpen(true)}
              size="sm"
              type="button"
              variant="ghost-muted"
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
              variant="ghost-muted"
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
                className="@sm:ml-1 @sm:w-auto w-full"
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
                {messages.endpoints.addResponse}
              </Button>
            </ProtectedAction>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          delay: STAGGER_DELAY * 2,
          duration: PAGE_ANIMATION_DURATION,
          ease: "easeOut",
        }}
      >
        <EndpointDetailLayout
          endpointId={endpoint.id}
          endpointMethod={endpoint.method}
          endpointSlug={endpoint.slug}
          endpointUrl={endpoint.url}
          isActivating={isActivatingResponse}
          isDeactivating={isDeactivatingResponse}
          onActivateResponse={handleActivateResponse}
          onCloneResponse={handleCloneResponse}
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
          delay: STAGGER_DELAY * 3,
          duration: PAGE_ANIMATION_DURATION,
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
            <AlertDialogTitle>
              {messages.endpoints.discardUnsavedChangesTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {messages.endpoints.discardUnsavedChangesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepEditing}>
              {messages.endpoints.keepEditing}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              {messages.endpoints.discardAndSwitch}
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
            <AlertDialogTitle>
              {messages.endpoints.deleteEndpointConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this endpoint{" "}
              <span className="font-semibold">
                {endpoint?.method} {endpoint?.url}
              </span>
              ? This action cannot be undone and will permanently remove:
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>{messages.endpoints.deleteEndpointDialogListConfig}</li>
                <li>
                  {formatMessage(
                    messages.endpoints.deleteEndpointDialogListResponses,
                    { count: endpoint?.responses.length || 0 }
                  )}
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEndpoint}>
              {messages.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingEndpoint}
              onClick={handleConfirmDeleteEndpoint}
              variant="destructive"
            >
              {isDeletingEndpoint
                ? messages.endpoints.deleting
                : messages.endpoints.deleteEndpointConfirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
