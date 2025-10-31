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
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { EndpointCard } from "@/features/endpoints/components/endpoint-card";
import { EndpointCardSkeleton } from "@/features/endpoints/components/endpoint-card-skeleton";
import { EndpointsSearchControls } from "@/features/endpoints/components/endpoints-search-controls";
import { useCreateEndpoint } from "@/features/endpoints/hooks/use-create-endpoint";
import { useGetEndpoints } from "@/features/endpoints/hooks/use-get-endpoints";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint } from "@/features/endpoints/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";

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

  const hasEndpoints = endpoints.length > 0;
  const hasFilteredEndpoints = filteredEndpoints.length > 0;

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
        <AddEndpointSheet
          isSubmitting={isCreatingEndpoint}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddEndpoint}
          open={isDialogOpen}
          showTrigger={hasEndpoints}
        />
      </div>

      {isLoadingEndpoints && (
        <>
          <EndpointsSearchControls onSearchChange={setSearchTerm} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <EndpointCardSkeleton key={key} />
            ))}
          </div>
        </>
      )}

      {!isLoadingEndpoints && hasEndpoints && (
        <>
          <EndpointsSearchControls onSearchChange={setSearchTerm} />

          {hasFilteredEndpoints ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEndpoints.map((endpoint) => (
                <EndpointCard endpoint={endpoint} key={endpoint.id} />
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
            <Button onClick={handleCreateEndpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Endpoint Pertama
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
