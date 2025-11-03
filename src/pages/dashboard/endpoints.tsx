import { Plug, Plus } from "lucide-react";
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
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { EndpointCard } from "@/features/endpoints/components/endpoint-card";
import { EndpointCardSkeleton } from "@/features/endpoints/components/endpoint-card-skeleton";
import { EndpointListItem } from "@/features/endpoints/components/endpoint-list-item";
import { EndpointListSkeleton } from "@/features/endpoints/components/endpoint-list-skeleton";
import { EndpointsSearchControls } from "@/features/endpoints/components/endpoints-search-controls";
import { useCreateEndpoint } from "@/features/endpoints/hooks/use-create-endpoint";
import { useGetEndpoints } from "@/features/endpoints/hooks/use-get-endpoints";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint } from "@/features/endpoints/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";

const SKELETON_KEYS = Array.from({ length: 6 }, () => crypto.randomUUID());

export function EndpointsPage() {
  useDocumentMeta({
    title: "Endpoint",
    description: "Kelola endpoint API dan integrasi untuk simulasi billing",
    keywords: ["api endpoints", "integrations", "api management", "endpoints"],
  });

  const { data: endpoints = [], isPending: isLoadingEndpoints } =
    useGetEndpoints();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "endpoints-view-mode",
    "grid"
  );

  const { mutate: createEndpoint, isPending: isCreatingEndpoint } =
    useCreateEndpoint();

  const filteredEndpoints = useMemo<Endpoint[]>(() => {
    const query = searchTerm.trim().toLowerCase();

    if (query.length === 0) {
      return endpoints;
    }

    return endpoints.filter((endpoint) => {
      const matchesUrl = endpoint.url.toLowerCase().includes(query);
      const matchesMethod = endpoint.method.toLowerCase().includes(query);
      const matchesBiller = endpoint.billerId.toString().includes(query);
      const matchesResponse = endpoint.responses.some((response) =>
        response.name.toLowerCase().includes(query)
      );

      return matchesUrl || matchesMethod || matchesBiller || matchesResponse;
    });
  }, [endpoints, searchTerm]);

  const groupedEndpoints = useMemo(() => {
    if (filteredEndpoints.length === 0) {
      return [];
    }

    const groups = new Map<number, Endpoint[]>();

    for (const endpoint of filteredEndpoints) {
      const existing = groups.get(endpoint.billerId);

      if (existing) {
        existing.push(endpoint);
      } else {
        groups.set(endpoint.billerId, [endpoint]);
      }
    }

    const sortedBillerIds = Array.from(groups.keys()).sort((a, b) => a - b);

    return sortedBillerIds.map((billerId) => ({
      billerId,
      endpoints: groups.get(billerId) ?? [],
    }));
  }, [filteredEndpoints]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      </div>

      {isLoadingEndpoints && (
        <>
          <EndpointsSearchControls
            onSearchChange={setSearchTerm}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
          />
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {SKELETON_KEYS.map((key) => (
                <EndpointCardSkeleton key={key} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {SKELETON_KEYS.map((key) => (
                <EndpointListSkeleton key={key} />
              ))}
            </div>
          )}
        </>
      )}

      {!isLoadingEndpoints && hasEndpoints && (
        <>
          <EndpointsSearchControls
            onSearchChange={setSearchTerm}
            onViewModeChange={setViewMode}
            viewMode={viewMode}
          />

          {hasFilteredEndpoints ? (
            <div className="space-y-8">
              {groupedEndpoints.map((group) => (
                <section className="space-y-4" key={group.billerId}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-lg">
                      Biller ID {group.billerId}
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
                </section>
              ))}
            </div>
          ) : (
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
          )}
        </>
      )}

      {!(isLoadingEndpoints || hasEndpoints) && (
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
      )}
    </div>
  );
}
