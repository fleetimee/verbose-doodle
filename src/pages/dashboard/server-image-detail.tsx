import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ChevronLeft, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  fetchServerEntry,
  fetchServerImages,
} from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import { ServerImageDetail } from "@/features/server-inventory/components/server-image-detail";
import { ServerImageDetailSkeleton } from "@/features/server-inventory/components/server-image-skeleton";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

export function ServerImageDetailPage() {
  const { messages } = useI18n();
  const copy = messages.servers.images;
  const { serverId = "", imageId = "" } = useParams();
  const [params] = useSearchParams();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const host = useQuery({
    queryKey: ["server-inventory", "detail", serverId],
    queryFn: ({ signal }) => fetchServerEntry(serverId, signal),
    retry: false,
    gcTime: 0,
  });
  const entry = host.data;
  const eligible = Boolean(
    entry?.username && entry.hasPassword && entry.accessType !== "RDP"
  );
  const query = useQuery({
    queryKey: [
      "server-inventory",
      "image-detail",
      serverId,
      entry?.updatedAt,
      imageId,
    ],
    queryFn: ({ signal }) => fetchServerImages(serverId, signal, imageId),
    enabled: eligible,
    retry: false,
    gcTime: 60_000,
  });
  const imageError = useContainerError(query.data?.status, query.error);
  const error = host.isError ? getErrorMessage(host.error) : imageError;
  const backParams = new URLSearchParams(params);
  backParams.delete("layerSort");
  backParams.delete("layerDirection");
  backParams.delete("image");
  const back = `/dashboard/server-metrics/${serverId}${backParams.size ? `?${backParams}` : ""}#docker-images`;
  const image = query.data?.inspect;
  const name = Array.isArray(image?.RepoTags) ? image.RepoTags[0] : undefined;
  useDocumentMeta({
    title: `${name || copy.details} | Fleetime Labs`,
    description: copy.detailDescription,
  });
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [imageId]);
  const loading = !error && (host.isPending || (eligible && query.isPending));
  const refreshing = host.isFetching || query.isFetching;
  return (
    <div className="server-monitor-workspace mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 pb-8">
      <div className="flex flex-col gap-5">
        <div>
          <Button render={<Link to={back} />} size="sm" variant="ghost">
            <ChevronLeft data-icon="inline-start" />
            {copy.backToImages}
          </Button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h1
              className="font-semibold text-3xl tracking-tight outline-none"
              ref={titleRef}
              tabIndex={-1}
            >
              {copy.details}
            </h1>
            {host.isPending ? (
              <Skeleton className="h-4 w-48" variant="table" />
            ) : (
              <p className="break-all text-muted-foreground text-sm">
                {entry?.name}{" "}
                {entry && (
                  <span className="font-mono text-xs">
                    · {entry.host}:{entry.port ?? 22}
                  </span>
                )}
              </p>
            )}
          </div>
          <Button
            disabled={refreshing}
            onClick={async () => {
              const result = await host.refetch();
              if (
                result.data?.username &&
                result.data.hasPassword &&
                result.data.accessType !== "RDP"
              ) {
                await query.refetch();
              }
            }}
            size="sm"
            variant="outline"
          >
            {refreshing ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            {messages.servers.refresh}
          </Button>
        </div>
      </div>
      {loading && <ServerImageDetailSkeleton />}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {query.data?.status === "IMAGE_NOT_FOUND" ? copy.notFound : error}
            <Button
              onClick={() => (host.isError ? host.refetch() : query.refetch())}
              size="sm"
              variant="outline"
            >
              {messages.servers.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {entry && !eligible && (
        <Alert>
          <AlertDescription>
            {entry.accessType === "RDP"
              ? messages.servers.metrics.unsupported
              : messages.servers.containers.credentialsRequired}
          </AlertDescription>
        </Alert>
      )}
      {query.data?.status === "OK" && (
        <ServerImageDetail data={query.data} key={imageId} />
      )}
    </div>
  );
}
