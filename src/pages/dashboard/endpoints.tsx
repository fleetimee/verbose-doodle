import { Plug, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
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
import {
  filterEndpoints,
  groupEndpointsByBiller,
} from "@/features/endpoints/utils";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Skeleton loading constants
const SKELETON_TOTAL_COUNT = 18;
const SKELETON_GROUP_1_START = 0;
const SKELETON_GROUP_1_END = 9;
const SKELETON_GROUP_2_START = 9;
const SKELETON_GROUP_2_END = 13;
const SKELETON_GROUP_3_START = 13;
const SKELETON_GROUP_3_END = 18;

const SKELETON_KEYS = Array.from({ length: SKELETON_TOTAL_COUNT }, () =>
  crypto.randomUUID()
);

// Animation constants
const STAGGER_BASE_DELAY = 0.4;
const STAGGER_INCREMENT = 0.1;

export function EndpointsPage() {
  useDocumentMeta({
    title: "Endpoint",
    description: "Kelola endpoint API dan integrasi untuk simulasi billing",
    keywords: ["api endpoints", "integrations", "api management", "endpoints"],
  });

  const { data: endpoints = [], isPending: isLoadingEndpoints } =
    useGetEndpoints();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "endpoints-view-mode",
    "grid"
  );

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
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Endpoint</h1>
          <p className="text-muted-foreground">
            Kelola endpoint API dan integrasi Anda
          </p>
        </div>
        <ProtectedAction ability="canAddEndpoint">
          <AddEndpointSheet
            isSubmitting={isCreatingEndpoint}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleAddEndpoint}
            open={isDialogOpen}
            showTrigger={hasEndpoints}
          />
        </ProtectedAction>
      </motion.div>

      {isLoadingEndpoints && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <EndpointsSearchControls
                onSearchChange={setSearchTerm}
                onViewModeChange={setViewMode}
                viewMode={viewMode}
              />
            </div>
            <Button disabled variant="outline">
              <Postman className="mr-2 h-4 w-4" />
              Export to Postman
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
                viewMode={viewMode}
              />
            </div>
            <Button
              disabled={groupedEndpoints.length === 0}
              onClick={handleOpenExportDialog}
              variant="outline"
            >
              <Postman className="mr-2 h-4 w-4" />
              Export to Postman
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
                    <span className="text-muted-foreground text-sm">
                      {group.endpoints.length} endpoint
                    </span>
                  </div>
                  {viewMode === "grid" ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.endpoints.map((endpoint) => (
                        <EndpointCard endpoint={endpoint} key={endpoint.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.endpoints.map((endpoint) => (
                        <EndpointListItem
                          endpoint={endpoint}
                          key={endpoint.id}
                        />
                      ))}
                    </div>
                  )}
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
                  <EmptyTitle>Tidak ada endpoint ditemukan</EmptyTitle>
                  <EmptyDescription>
                    Ubah kata kunci pencarian atau reset filter untuk melihat
                    daftar endpoint.
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
              <EmptyTitle>Belum ada endpoint</EmptyTitle>
              <EmptyDescription>
                Mulai dengan membuat endpoint API pertama Anda untuk biller yang
                tersedia.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ProtectedAction ability="canAddEndpoint">
                <Button onClick={handleCreateEndpoint}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Endpoint Pertama
                </Button>
              </ProtectedAction>
            </EmptyContent>
          </Empty>
        </motion.div>
      )}
    </motion.div>
  );
}
