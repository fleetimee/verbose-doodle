import { CircleHelp, Layers3, Plug, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type TourStep, useTour } from "@/components/tour";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Postman } from "@/components/ui/svgs/postman";
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { EndpointCard } from "@/features/endpoints/components/endpoint-card";
import { EndpointCardSkeleton } from "@/features/endpoints/components/endpoint-card-skeleton";
import { EndpointListItem } from "@/features/endpoints/components/endpoint-list-item";
import { EndpointListSkeleton } from "@/features/endpoints/components/endpoint-list-skeleton";
import { EndpointsSearchControls } from "@/features/endpoints/components/endpoints-search-controls";
import { ExportEndpointsDialog } from "@/features/endpoints/components/export-endpoints-dialog";
import { useCreateEndpoint } from "@/features/endpoints/hooks/use-create-endpoint";
import { useGetEndpoints } from "@/features/endpoints/hooks/use-get-endpoints";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint, GroupedEndpoints } from "@/features/endpoints/types";
import {
  filterEndpoints,
  groupEndpointsByBiller,
} from "@/features/endpoints/utils";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";

// Skeleton loading constants
const SKELETON_TOTAL_COUNT = 18;
const SKELETON_GROUP_1_START = 0;
const SKELETON_GROUP_1_END = 9;
const SKELETON_GROUP_2_START = 9;
const SKELETON_GROUP_2_END = 13;
const SKELETON_GROUP_3_START = 13;
const SKELETON_GROUP_3_END = 18;

const SKELETON_KEYS = Array.from(
  { length: SKELETON_TOTAL_COUNT },
  (_, i) => `skeleton-${i}`
);

// Animation constants
const STAGGER_BASE_DELAY = 0.4;
const STAGGER_INCREMENT = 0.1;
const VIEW_ITEM_STAGGER = 0.035;
const VIEW_ITEM_STAGGER_LIMIT = 9;
const ENDPOINTS_TOUR_ID = "endpoints-intro";
const ENDPOINTS_TOUR_TARGETS = {
  header: "endpoints-tour-header",
  addEndpoint: "endpoints-tour-add-endpoint",
  createFirstEndpoint: "endpoints-tour-create-first-endpoint",
  search: "endpoints-tour-search",
  viewMode: "endpoints-tour-view-mode",
  export: "endpoints-tour-export",
  firstEndpoint: "endpoints-tour-first-endpoint",
} as const;

type EndpointViewMode = "grid" | "list";

function TourStepContent({
  title,
  description,
}: {
  title: string;
  description: string;
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

function ViewModeSweep({ viewMode }: { viewMode: EndpointViewMode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 overflow-hidden">
      <motion.div
        animate={{
          opacity: [0, 1, 0],
          scaleX: [0.15, 1, 0.75],
          y: [-8, 42, 96],
        }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent shadow-[0_0_28px_hsl(var(--primary)/0.45)]"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0, scaleX: 0.15, y: -8 }}
        key={`sweep-${viewMode}`}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

type AnimatedEndpointGroupProps = {
  readonly group: GroupedEndpoints;
  readonly groupIndex: number;
  readonly prefersReducedMotion: boolean;
  readonly viewMode: EndpointViewMode;
};

type AnimatedEndpointItemsProps = {
  readonly endpoints: Endpoint[];
  readonly groupIndex: number;
  readonly prefersReducedMotion: boolean;
};

function getEndpointTourId(groupIndex: number, endpointIndex: number) {
  return groupIndex === 0 && endpointIndex === 0
    ? ENDPOINTS_TOUR_TARGETS.firstEndpoint
    : undefined;
}

function getViewItemDelay(
  endpointIndex: number,
  prefersReducedMotion: boolean
) {
  if (prefersReducedMotion) {
    return 0;
  }

  return Math.min(endpointIndex, VIEW_ITEM_STAGGER_LIMIT) * VIEW_ITEM_STAGGER;
}

function AnimatedGridEndpoints({
  endpoints,
  groupIndex,
  prefersReducedMotion,
}: AnimatedEndpointItemsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      exit={{
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.98,
        y: prefersReducedMotion ? 0 : -10,
      }}
      initial={{
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 0.96,
        y: prefersReducedMotion ? 0 : 14,
      }}
      key="grid"
      layout
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.34,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {endpoints.map((endpoint, endpointIndex) => (
        <motion.div
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{
            opacity: 0,
            rotateX: prefersReducedMotion ? 0 : 8,
            y: prefersReducedMotion ? 0 : -10,
          }}
          initial={{
            opacity: 0,
            rotateX: prefersReducedMotion ? 0 : -10,
            y: prefersReducedMotion ? 0 : 18,
          }}
          key={endpoint.id}
          layout
          transition={{
            delay: getViewItemDelay(endpointIndex, prefersReducedMotion),
            duration: prefersReducedMotion ? 0.1 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <EndpointCard
            endpoint={endpoint}
            tourId={getEndpointTourId(groupIndex, endpointIndex)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function AnimatedListEndpoints({
  endpoints,
  groupIndex,
  prefersReducedMotion,
}: AnimatedEndpointItemsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="space-y-3"
      exit={{
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 1.01,
        y: prefersReducedMotion ? 0 : 10,
      }}
      initial={{
        opacity: 0,
        scale: prefersReducedMotion ? 1 : 1.02,
        y: prefersReducedMotion ? 0 : -14,
      }}
      key="list"
      layout
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.34,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {endpoints.map((endpoint, endpointIndex) => (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          exit={{
            opacity: 0,
            x: prefersReducedMotion ? 0 : 18,
          }}
          initial={{
            opacity: 0,
            x: prefersReducedMotion ? 0 : -18,
          }}
          key={endpoint.id}
          layout
          transition={{
            delay: getViewItemDelay(endpointIndex, prefersReducedMotion),
            duration: prefersReducedMotion ? 0.1 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <EndpointListItem
            endpoint={endpoint}
            tourId={getEndpointTourId(groupIndex, endpointIndex)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function AnimatedEndpointGroup({
  group,
  groupIndex,
  prefersReducedMotion,
  viewMode,
}: AnimatedEndpointGroupProps) {
  return (
    <div className="relative rounded-lg">
      {!prefersReducedMotion && <ViewModeSweep viewMode={viewMode} />}
      <AnimatePresence initial={false} mode="popLayout">
        {viewMode === "grid" ? (
          <AnimatedGridEndpoints
            endpoints={group.endpoints}
            groupIndex={groupIndex}
            key="grid"
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : (
          <AnimatedListEndpoints
            endpoints={group.endpoints}
            groupIndex={groupIndex}
            key="list"
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function EndpointsPage() {
  useDocumentMeta({
    title: "Endpoint",
    description: messages.endpoints.documentDescription,
    keywords: ["api endpoints", "integrations", "api management", "endpoints"],
  });

  const { data: endpoints = [], isPending: isLoadingEndpoints } =
    useGetEndpoints();
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "endpoints-view-mode",
    "grid"
  );
  const [hasSeenEndpointsTour, setHasSeenEndpointsTour] = useLocalStorage(
    "endpoints-tour-seen",
    false
  );
  const hasAutoStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;

  const { mutate: createEndpoint, isPending: isCreatingEndpoint } =
    useCreateEndpoint();

  const filteredEndpoints = useMemo(
    () => filterEndpoints(endpoints, searchTerm),
    [endpoints, searchTerm]
  );

  const groupedEndpoints = useMemo(
    () => groupEndpointsByBiller(filteredEndpoints),
    [filteredEndpoints]
  );

  const hasEndpoints = endpoints.length > 0;
  const hasFilteredEndpoints = groupedEndpoints.length > 0;
  const canAddEndpoint = can("canAddEndpoint");

  const handleCreateEndpoint = () => {
    setIsDialogOpen(true);
  };

  const handleAddEndpoint = (data: EndpointFormData) => {
    createEndpoint(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  const handleOpenExportDialog = () => {
    setIsExportDialogOpen(true);
  };

  const tourSteps = useMemo<TourStep[]>(() => {
    const baseSteps: TourStep[] = [
      {
        selectorId: ENDPOINTS_TOUR_TARGETS.header,
        position: "bottom",
        content: (
          <TourStepContent
            description={messages.endpoints.tour.workspaceDescription}
            title={messages.endpoints.tour.workspaceTitle}
          />
        ),
      },
    ];

    if (!hasEndpoints && canAddEndpoint) {
      return [
        ...baseSteps,
        {
          selectorId: ENDPOINTS_TOUR_TARGETS.createFirstEndpoint,
          position: "top",
          content: (
            <TourStepContent
              description={messages.endpoints.tour.createFirstDescription}
              title={messages.endpoints.tour.createFirstTitle}
            />
          ),
        },
      ];
    }

    return [
      ...baseSteps,
      ...(canAddEndpoint
        ? [
            {
              selectorId: ENDPOINTS_TOUR_TARGETS.addEndpoint,
              position: "left" as const,
              content: (
                <TourStepContent
                  description={messages.endpoints.tour.addEndpointDescription}
                  title={messages.endpoints.tour.addEndpointTitle}
                />
              ),
            },
          ]
        : []),
      {
        selectorId: ENDPOINTS_TOUR_TARGETS.search,
        position: "bottom",
        content: (
          <TourStepContent
            description={messages.endpoints.tour.searchDescription}
            title={messages.endpoints.tour.searchTitle}
          />
        ),
      },
      {
        selectorId: ENDPOINTS_TOUR_TARGETS.viewMode,
        position: "bottom",
        content: (
          <TourStepContent
            description={messages.endpoints.tour.viewModeDescription}
            title={messages.endpoints.tour.viewModeTitle}
          />
        ),
      },
      {
        selectorId: ENDPOINTS_TOUR_TARGETS.export,
        position: "left",
        content: (
          <TourStepContent
            description={messages.endpoints.tour.exportDescription}
            title={messages.endpoints.tour.exportTitle}
          />
        ),
      },
      ...(hasFilteredEndpoints
        ? [
            {
              selectorId: ENDPOINTS_TOUR_TARGETS.firstEndpoint,
              position: "top" as const,
              content: (
                <TourStepContent
                  description={messages.endpoints.tour.detailsDescription}
                  title={messages.endpoints.tour.detailsTitle}
                />
              ),
            },
          ]
        : []),
    ];
  }, [canAddEndpoint, hasEndpoints, hasFilteredEndpoints]);

  const handleStartTour = useCallback(() => {
    setSteps(tourSteps);
    startTour(ENDPOINTS_TOUR_ID);
  }, [setSteps, startTour, tourSteps]);

  useEffect(() => {
    if (
      isLoadingEndpoints ||
      hasSeenEndpointsTour ||
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
    handleStartTour,
    hasSeenEndpointsTour,
    isLoadingEndpoints,
    setHasSeenEndpointsTour,
    tourSteps.length,
  ]);

  useEffect(() => {
    if (
      shouldMarkTourSeenOnEnd.current &&
      activeTourId === ENDPOINTS_TOUR_ID &&
      !isActive
    ) {
      shouldMarkTourSeenOnEnd.current = false;
      setHasSeenEndpointsTour(true);
    }
  }, [activeTourId, isActive, setHasSeenEndpointsTour]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
        id={ENDPOINTS_TOUR_TARGETS.header}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Endpoint</h1>
          <p className="text-muted-foreground">
            {messages.endpoints.pageDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleStartTour}
            size="sm"
            type="button"
            variant="outline"
          >
            <CircleHelp data-icon="inline-start" />
            {messages.endpoints.tour.startButton}
          </Button>
          <ProtectedAction ability="canAddEndpoint">
            <div
              id={hasEndpoints ? ENDPOINTS_TOUR_TARGETS.addEndpoint : undefined}
            >
              <AddEndpointSheet
                isSubmitting={isCreatingEndpoint}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleAddEndpoint}
                open={isDialogOpen}
                showTrigger={hasEndpoints}
              />
            </div>
          </ProtectedAction>
        </div>
      </motion.div>

      {isLoadingEndpoints && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <EndpointsSearchControls
                onSearchChange={setSearchTerm}
                onViewModeChange={setViewMode}
                searchId={ENDPOINTS_TOUR_TARGETS.search}
                viewMode={viewMode}
                viewModeId={ENDPOINTS_TOUR_TARGETS.viewMode}
              />
            </div>
            <Button disabled variant="outline">
              <Postman className="mr-2 h-4 w-4" />
              {messages.endpoints.exportToPostman}
            </Button>
          </div>

          <div className="space-y-8">
            {/* First group skeleton - 9 items */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_1_START,
                    SKELETON_GROUP_1_END
                  ).map((key) => (
                    <EndpointCardSkeleton key={key} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_1_START,
                    SKELETON_GROUP_1_END
                  ).map((key) => (
                    <EndpointListSkeleton key={key} />
                  ))}
                </div>
              )}
            </section>

            {/* Second group skeleton - 4 items */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
              {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_2_START,
                    SKELETON_GROUP_2_END
                  ).map((key) => (
                    <EndpointCardSkeleton key={key} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_2_START,
                    SKELETON_GROUP_2_END
                  ).map((key) => (
                    <EndpointListSkeleton key={key} />
                  ))}
                </div>
              )}
            </section>

            {/* Third group skeleton - 5 items */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-5 w-24" />
              </div>
              {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_3_START,
                    SKELETON_GROUP_3_END
                  ).map((key) => (
                    <EndpointCardSkeleton key={key} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {SKELETON_KEYS.slice(
                    SKELETON_GROUP_3_START,
                    SKELETON_GROUP_3_END
                  ).map((key) => (
                    <EndpointListSkeleton key={key} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {!isLoadingEndpoints && hasEndpoints && (
        <>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex-1">
              <EndpointsSearchControls
                onSearchChange={setSearchTerm}
                onViewModeChange={setViewMode}
                searchId={ENDPOINTS_TOUR_TARGETS.search}
                viewMode={viewMode}
                viewModeId={ENDPOINTS_TOUR_TARGETS.viewMode}
              />
            </div>
            <Button
              disabled={groupedEndpoints.length === 0}
              id={ENDPOINTS_TOUR_TARGETS.export}
              onClick={handleOpenExportDialog}
              variant="outline"
            >
              <Postman className="mr-2 h-4 w-4" />
              {messages.endpoints.exportToPostman}
            </Button>
          </motion.div>

          <ExportEndpointsDialog
            groupedEndpoints={groupedEndpoints}
            onOpenChange={setIsExportDialogOpen}
            open={isExportDialogOpen}
          />

          {hasFilteredEndpoints ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              {groupedEndpoints.map((group, index) => (
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  key={group.billerId}
                  transition={{
                    duration: 0.3,
                    delay: STAGGER_BASE_DELAY + index * STAGGER_INCREMENT,
                    ease: "easeOut",
                  }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-lg">
                      {group.billerName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/35 px-2.5 py-1 font-medium text-muted-foreground text-xs">
                      <Layers3 className="h-3.5 w-3.5" />
                      {group.endpoints.length} endpoint
                      {group.endpoints.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <AnimatedEndpointGroup
                    group={group}
                    groupIndex={index}
                    prefersReducedMotion={shouldReduceMotion}
                    viewMode={viewMode}
                  />
                </motion.section>
              ))}
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Plug />
                  </EmptyMedia>
                  <EmptyTitle>
                    {messages.endpoints.noSearchResultsTitle}
                  </EmptyTitle>
                  <EmptyDescription>
                    {messages.endpoints.noSearchResultsDescription}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}
        </>
      )}

      {!(isLoadingEndpoints || hasEndpoints) && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <Empty className="min-h-[60vh] border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Plug />
              </EmptyMedia>
              <EmptyTitle>{messages.endpoints.emptyTitle}</EmptyTitle>
              <EmptyDescription>
                {messages.endpoints.emptyDescription}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ProtectedAction ability="canAddEndpoint">
                <Button
                  id={ENDPOINTS_TOUR_TARGETS.createFirstEndpoint}
                  onClick={handleCreateEndpoint}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {messages.endpoints.createFirstButton}
                </Button>
              </ProtectedAction>
            </EmptyContent>
          </Empty>
        </motion.div>
      )}
    </motion.div>
  );
}
