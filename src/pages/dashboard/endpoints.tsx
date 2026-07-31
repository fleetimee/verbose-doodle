import {
  Add01Icon,
  HelpCircleIcon,
  Pen01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Layers3, Plug } from "@/components/hugeicons";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { useAuth } from "@/features/auth/context";
import { EditBillerDialog } from "@/features/billers/components/edit-biller-dialog";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import { useUpdateBiller } from "@/features/billers/hooks/use-update-biller";
import type { Biller } from "@/features/billers/types";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { DeleteEndpointDialog } from "@/features/endpoints/components/delete-endpoint-dialog";
import { EditEndpointSheet } from "@/features/endpoints/components/edit-endpoint-sheet";
import { EndpointCard } from "@/features/endpoints/components/endpoint-card";
import { EndpointCardSkeleton } from "@/features/endpoints/components/endpoint-card-skeleton";
import { EndpointContextMenu } from "@/features/endpoints/components/endpoint-context-menu";
import { EndpointListItem } from "@/features/endpoints/components/endpoint-list-item";
import { EndpointListSkeleton } from "@/features/endpoints/components/endpoint-list-skeleton";
import { EndpointsSearchControls } from "@/features/endpoints/components/endpoints-search-controls";
import { ExportEndpointsDialog } from "@/features/endpoints/components/export-endpoints-dialog";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint, GroupedEndpoints } from "@/features/endpoints/types";
import {
  filterEndpoints,
  groupEndpointsByBiller,
} from "@/features/endpoints/utils";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

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

function parseBillerSlug(value: string | null): string | null {
  const slug = value?.trim();
  return slug ? slug : null;
}

function filterEndpointsByBiller(
  endpoints: Endpoint[],
  billerSlug: string | null,
  isBillerScoped: boolean
): Endpoint[] {
  if (!isBillerScoped) {
    return endpoints;
  }

  if (billerSlug === null) {
    return [];
  }

  return endpoints.filter((endpoint) => endpoint.billerSlug === billerSlug);
}

function getEmptyStateCopy(
  isUnknownBillerScope: boolean,
  isBillerScoped: boolean,
  hasSearchTerm: boolean
) {
  if (isUnknownBillerScope) {
    return {
      description: messages.endpoints.billerNotFoundDescription,
      title: messages.endpoints.billerNotFoundTitle,
    };
  }

  if (isBillerScoped && !hasSearchTerm) {
    return {
      description: messages.endpoints.scopedEmptyDescription,
      title: messages.endpoints.scopedEmptyTitle,
    };
  }

  return {
    description: messages.endpoints.noSearchResultsDescription,
    title: messages.endpoints.noSearchResultsTitle,
  };
}

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

type AnimatedEndpointGroupProps = {
  readonly group: GroupedEndpoints;
  readonly groupIndex: number;
  readonly onDeleteEndpoint: (endpoint: Endpoint) => void;
  readonly onEditEndpoint: (endpoint: Endpoint) => void;
  readonly prefersReducedMotion: boolean;
  readonly viewMode: EndpointViewMode;
  readonly canEditEndpoint: boolean;
};

function getEndpointTourId(groupIndex: number, endpointIndex: number) {
  return groupIndex === 0 && endpointIndex === 0
    ? ENDPOINTS_TOUR_TARGETS.firstEndpoint
    : undefined;
}

function GridEndpoints({
  canEditEndpoint,
  group,
  groupIndex,
  onDeleteEndpoint,
  onEditEndpoint,
}: Omit<AnimatedEndpointGroupProps, "prefersReducedMotion" | "viewMode">) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {group.endpoints.map((endpoint, endpointIndex) => (
        <EndpointContextMenu
          canEdit={canEditEndpoint}
          endpoint={endpoint}
          key={endpoint.slug}
          onDelete={onDeleteEndpoint}
          onEdit={onEditEndpoint}
        >
          <div>
            <EndpointCard
              endpoint={endpoint}
              tourId={getEndpointTourId(groupIndex, endpointIndex)}
            />
          </div>
        </EndpointContextMenu>
      ))}
    </div>
  );
}

function ListEndpoints({
  canEditEndpoint,
  group,
  groupIndex,
  onDeleteEndpoint,
  onEditEndpoint,
}: Omit<AnimatedEndpointGroupProps, "prefersReducedMotion" | "viewMode">) {
  return (
    <div className="space-y-3">
      {group.endpoints.map((endpoint, endpointIndex) => (
        <EndpointContextMenu
          canEdit={canEditEndpoint}
          endpoint={endpoint}
          key={endpoint.slug}
          onDelete={onDeleteEndpoint}
          onEdit={onEditEndpoint}
        >
          <div>
            <EndpointListItem
              endpoint={endpoint}
              tourId={getEndpointTourId(groupIndex, endpointIndex)}
            />
          </div>
        </EndpointContextMenu>
      ))}
    </div>
  );
}

function AnimatedEndpointGroup({
  group,
  groupIndex,
  canEditEndpoint,
  onDeleteEndpoint,
  onEditEndpoint,
  prefersReducedMotion,
  viewMode,
}: AnimatedEndpointGroupProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="rounded-lg"
      initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
      key={viewMode}
      transition={{
        duration: prefersReducedMotion
          ? MOTION_DURATION.instant
          : MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
      }}
    >
      {viewMode === "grid" ? (
        <GridEndpoints
          canEditEndpoint={canEditEndpoint}
          group={group}
          groupIndex={groupIndex}
          onDeleteEndpoint={onDeleteEndpoint}
          onEditEndpoint={onEditEndpoint}
        />
      ) : (
        <ListEndpoints
          canEditEndpoint={canEditEndpoint}
          group={group}
          groupIndex={groupIndex}
          onDeleteEndpoint={onDeleteEndpoint}
          onEditEndpoint={onEditEndpoint}
        />
      )}
    </motion.div>
  );
}

export function EndpointsPage() {
  useDocumentMeta({
    title: "Endpoint",
    description: messages.endpoints.documentDescription,
    keywords: ["api endpoints", "integrations", "api management", "endpoints"],
  });

  const {
    endpoints: endpointsQuery,
    createEndpoint: createEndpointMutation,
    deleteEndpoint: deleteEndpointMutation,
    updateEndpoint: updateEndpointMutation,
  } = useEndpointCatalog();
  const { data: endpoints = [], isPending: isLoadingEndpoints } =
    endpointsQuery;
  const [searchParams] = useSearchParams();
  const { data: billers = [], isPending: isLoadingBillers } = useGetBillers();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialBillerSlug, setInitialBillerSlug] = useState<
    string | undefined
  >();
  const [billerToEdit, setBillerToEdit] = useState<Biller | null>(null);
  const [endpointToEdit, setEndpointToEdit] = useState<Endpoint | null>(null);
  const [endpointToDelete, setEndpointToDelete] = useState<Endpoint | null>(
    null
  );
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

  const billerSlugParam = searchParams.get("billerSlug");
  const selectedBillerSlug = parseBillerSlug(billerSlugParam);
  const isBillerScoped = billerSlugParam !== null;
  const hasKnownBiller =
    selectedBillerSlug !== null &&
    billers.some((biller) => biller.slug === selectedBillerSlug);
  const isUnknownBillerScope =
    isBillerScoped && !isLoadingBillers && !hasKnownBiller;

  const { mutate: createEndpoint, isPending: isCreatingEndpoint } =
    createEndpointMutation;
  const { mutate: updateEndpoint, isPending: isUpdatingEndpoint } =
    updateEndpointMutation;
  const { mutate: deleteEndpoint, isPending: isDeletingEndpoint } =
    deleteEndpointMutation;
  const { mutate: updateBiller, isPending: isUpdatingBiller } =
    useUpdateBiller();

  const scopedEndpoints = useMemo(
    () =>
      filterEndpointsByBiller(endpoints, selectedBillerSlug, isBillerScoped),
    [endpoints, isBillerScoped, selectedBillerSlug]
  );

  const filteredEndpoints = useMemo(
    () => filterEndpoints(scopedEndpoints, searchTerm),
    [scopedEndpoints, searchTerm]
  );

  const groupedEndpoints = useMemo(
    () => groupEndpointsByBiller(filteredEndpoints),
    [filteredEndpoints]
  );

  const hasEndpoints = scopedEndpoints.length > 0;
  const hasFilteredEndpoints = groupedEndpoints.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const shouldShowCatalog = isBillerScoped || hasEndpoints || hasSearchTerm;
  const canAddEndpoint = session.can("canAddEndpoint");
  const canEditEndpoint = session.can("canEditEndpoint");

  const handleCreateEndpoint = (
    billerSlug = selectedBillerSlug ?? undefined
  ) => {
    setInitialBillerSlug(billerSlug);
    setIsDialogOpen(true);
  };

  const handleAddEndpoint = (data: EndpointFormData) => {
    createEndpoint(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  const handleEditEndpoint = (data: EndpointFormData) => {
    if (!endpointToEdit) {
      return;
    }

    updateEndpoint(
      {
        endpointSlug: endpointToEdit.slug,
        changes: {
          method: data.method,
          url: data.url,
        },
      },
      {
        onSuccess: () => {
          setEndpointToEdit(null);
        },
      }
    );
  };

  const handleEditBiller = (billerName: string) => {
    if (!billerToEdit) {
      return;
    }

    updateBiller(
      { billerName, slug: billerToEdit.slug },
      {
        onSuccess: () => {
          setBillerToEdit(null);
        },
      }
    );
  };

  const handleDeleteEndpoint = () => {
    if (!endpointToDelete) {
      return;
    }

    deleteEndpoint(endpointToDelete.slug, {
      onSuccess: () => {
        setEndpointToDelete(null);
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

    if (!(hasEndpoints || isUnknownBillerScope) && canAddEndpoint) {
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
  }, [
    canAddEndpoint,
    hasEndpoints,
    hasFilteredEndpoints,
    isUnknownBillerScope,
  ]);

  const handleStartTour = useCallback(() => {
    setSteps(tourSteps);
    startTour(ENDPOINTS_TOUR_ID);
  }, [setSteps, startTour, tourSteps]);

  const emptyStateCopy = getEmptyStateCopy(
    isUnknownBillerScope,
    isBillerScoped,
    hasSearchTerm
  );

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
      animate={{ opacity: 1 }}
      className="space-y-6"
      initial={{ opacity: 0 }}
      transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
        id={ENDPOINTS_TOUR_TARGETS.header}
        initial={{ opacity: 0 }}
        transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
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
            <HugeiconsIcon
              data-icon="inline-start"
              icon={HelpCircleIcon}
              strokeWidth={2}
            />
            {messages.endpoints.tour.startButton}
          </Button>
          <ProtectedAction ability="canAddEndpoint">
            <div
              id={hasEndpoints ? ENDPOINTS_TOUR_TARGETS.addEndpoint : undefined}
            >
              <AddEndpointSheet
                initialBillerSlug={initialBillerSlug}
                isSubmitting={isCreatingEndpoint}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleAddEndpoint}
                onTriggerClick={() => handleCreateEndpoint()}
                open={isDialogOpen}
                showTrigger={hasEndpoints}
              />
            </div>
          </ProtectedAction>
          <ProtectedAction ability="canAddBiller">
            <EditBillerDialog
              biller={billerToEdit}
              isSubmitting={isUpdatingBiller}
              onOpenChange={(open) => {
                if (!open) {
                  setBillerToEdit(null);
                }
              }}
              onSubmit={handleEditBiller}
              open={billerToEdit !== null}
            />
          </ProtectedAction>
          <ProtectedAction ability="canEditEndpoint">
            <EditEndpointSheet
              endpoint={endpointToEdit}
              isSubmitting={isUpdatingEndpoint}
              onOpenChange={(open) => {
                if (!open) {
                  setEndpointToEdit(null);
                }
              }}
              onSubmit={handleEditEndpoint}
              open={endpointToEdit !== null}
            />
            <DeleteEndpointDialog
              endpoint={endpointToDelete}
              isDeleting={isDeletingEndpoint}
              onConfirm={handleDeleteEndpoint}
              onOpenChange={(open) => {
                if (!open) {
                  setEndpointToDelete(null);
                }
              }}
              open={endpointToDelete !== null}
            />
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
                searchValue={searchTerm}
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

      {!isLoadingEndpoints && shouldShowCatalog && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0 }}
            transition={{
              duration: MOTION_DURATION.fast,
              ease: MOTION_EASE.out,
            }}
          >
            <div className="flex-1">
              <EndpointsSearchControls
                onSearchChange={setSearchTerm}
                onViewModeChange={setViewMode}
                searchId={ENDPOINTS_TOUR_TARGETS.search}
                searchValue={searchTerm}
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
              animate={{ opacity: 1 }}
              className="space-y-8"
              initial={{ opacity: 0 }}
              transition={{
                duration: MOTION_DURATION.fast,
                ease: MOTION_EASE.out,
              }}
            >
              {groupedEndpoints.map((group, index) => (
                <section className="space-y-4" key={group.billerSlug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-lg">
                        {group.billerName}
                      </h2>
                      <ProtectedAction ability="canAddEndpoint">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-label={`Add endpoint for ${group.billerName}`}
                              className="border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                              onClick={() =>
                                handleCreateEndpoint(group.billerSlug)
                              }
                              size="icon-xs"
                              type="button"
                              variant="outline"
                            >
                              <HugeiconsIcon
                                className="size-3.5"
                                icon={Add01Icon}
                                strokeWidth={2}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add endpoint for {group.billerName}
                          </TooltipContent>
                        </Tooltip>
                      </ProtectedAction>
                      <ProtectedAction ability="canAddBiller">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              aria-label={`Edit biller ${group.billerName}`}
                              className="border-border/70 bg-background/70 text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                const biller = billers.find(
                                  (candidate) =>
                                    candidate.slug === group.billerSlug
                                );
                                setBillerToEdit(
                                  biller ?? {
                                    name: group.billerName,
                                    slug: group.billerSlug,
                                  }
                                );
                              }}
                              size="icon-xs"
                              type="button"
                              variant="outline"
                            >
                              <HugeiconsIcon
                                className="size-3.5"
                                icon={Pen01Icon}
                                strokeWidth={2}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Edit biller {group.billerName}
                          </TooltipContent>
                        </Tooltip>
                      </ProtectedAction>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/35 px-2.5 py-1 font-medium text-muted-foreground text-xs">
                      <Layers3 className="h-3.5 w-3.5" />
                      {group.endpoints.length} endpoint
                      {group.endpoints.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <AnimatedEndpointGroup
                    canEditEndpoint={canEditEndpoint}
                    group={group}
                    groupIndex={index}
                    onDeleteEndpoint={setEndpointToDelete}
                    onEditEndpoint={setEndpointToEdit}
                    prefersReducedMotion={shouldReduceMotion}
                    viewMode={viewMode}
                  />
                </section>
              ))}
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{
                duration: MOTION_DURATION.fast,
                ease: MOTION_EASE.out,
              }}
            >
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Plug />
                  </EmptyMedia>
                  <EmptyTitle>{emptyStateCopy.title}</EmptyTitle>
                  <EmptyDescription>
                    {emptyStateCopy.description}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )}
        </>
      )}

      {!(isLoadingEndpoints || shouldShowCatalog) && (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
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
              {!isUnknownBillerScope && (
                <ProtectedAction ability="canAddEndpoint">
                  <Button
                    id={ENDPOINTS_TOUR_TARGETS.createFirstEndpoint}
                    onClick={() => handleCreateEndpoint()}
                    type="button"
                  >
                    <HugeiconsIcon
                      className="mr-2 h-4 w-4"
                      icon={Add01Icon}
                      strokeWidth={2}
                    />
                    {messages.endpoints.createFirstButton}
                  </Button>
                </ProtectedAction>
              )}
            </EmptyContent>
          </Empty>
        </motion.div>
      )}
    </motion.div>
  );
}
