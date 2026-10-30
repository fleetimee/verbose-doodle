import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { SiDocker } from "react-icons/si";
import { Link, useLocation, useSearchParams } from "react-router";
import { ChevronRight } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchServerImages } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import { ServerImageCleanup } from "@/features/server-inventory/components/server-image-cleanup";
import { ServerImageListSkeleton } from "@/features/server-inventory/components/server-image-skeleton";
import {
  ImageSortHead,
  imageSizeBytes,
} from "@/features/server-inventory/components/server-image-table";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

const DOCKER_TIMEZONE = / ([+-]\d{2})(\d{2}) .*$/;

function ImageCreated({ value, locale }: { value: string; locale: string }) {
  const normalized = value.replace(DOCKER_TIMEZONE, "$1:$2").replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return <span>{value}</span>;
  }
  return (
    <div className="flex flex-col gap-1" title={value}>
      <span>
        {date.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
      <span className="text-muted-foreground text-xs">
        {date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

function ImageRepository({ repository }: { repository: string }) {
  const copy = useI18n().messages.servers.images;
  const untagged = repository === "<none>";
  const separator = repository.lastIndexOf("/");
  const name = untagged ? copy.untagged : repository.slice(separator + 1);
  let source = copy.localRepository;
  if (separator >= 0) {
    source = repository.slice(0, separator);
  }
  if (untagged) {
    source = copy.noRepository;
  }
  return (
    <div className="flex min-w-0 flex-col gap-1 py-1.5" title={repository}>
      <span className="truncate font-medium">{name}</span>
      <span className="truncate text-muted-foreground text-xs">{source}</span>
    </div>
  );
}

export function ServerImagesPanel({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.images;
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (location.hash === "#docker-images") {
      sectionRef.current?.scrollIntoView({ block: "start" });
    }
  }, [location.hash]);
  const search = params.get("imageSearch") ?? "";
  const sort = params.get("imageSort") ?? "CreatedAt";
  const descending = params.get("imageDirection") !== "asc";
  const sortBy = (column: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("imageSort", column);
        next.set(
          "imageDirection",
          sort === column && !descending ? "desc" : "asc"
        );
        next.delete("imagePage");
        return next;
      },
      { replace: true }
    );
  const query = useQuery({
    queryKey: ["server-inventory", "images", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerImages(entry.id, signal),
    enabled: !paused && Boolean(entry.username && entry.hasPassword),
    refetchInterval: paused ? false : 30_000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 60_000,
  });
  const error = useContainerError(query.data?.status, query.error);
  const update = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        if (key === "imageSearch") {
          next.delete("imagePage");
        }
        return next;
      },
      { replace: true }
    );
  const rows = (query.data?.images ?? []).filter((row) =>
    [row.Repository, row.Tag, row.ID].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase())
    )
  );
  rows.sort((left, right) => {
    const comparison =
      sort === "Size"
        ? imageSizeBytes(left.Size ?? "") - imageSizeBytes(right.Size ?? "")
        : (left[sort] ?? "").localeCompare(right[sort] ?? "", undefined, {
            numeric: true,
          });
    return (
      (descending ? -comparison : comparison) ||
      `${left.Repository}:${left.Tag}:${left.ID}`.localeCompare(
        `${right.Repository}:${right.Tag}:${right.ID}`
      )
    );
  });
  const detailParams = new URLSearchParams(params);
  detailParams.delete("image");
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  const page = Math.min(
    pages,
    Math.max(1, Math.floor(Number(params.get("imagePage"))) || 1)
  );
  return (
    <section
      aria-label={copy.title}
      className="flex min-w-0 scroll-mt-20 flex-col gap-4"
      id="docker-images"
      ref={sectionRef}
    >
      <Card className="min-w-0" size="monitor" variant="monitor">
        <CardHeader size="none">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SiDocker aria-hidden="true" className="size-6" />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="font-semibold text-xl tracking-tight">
                  {copy.title}
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {copy.description}
                </p>
              </div>
            </div>
            <div className="w-full shrink-0 sm:w-72">
              <Input
                aria-label={copy.search}
                onChange={(event) => update("imageSearch", event.target.value)}
                placeholder={copy.search}
                value={search}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {query.data?.status === "OK" && (
              <p aria-live="polite" className="text-muted-foreground text-xs">
                {formatMessage(copy.results, { count: rows.length })}
              </p>
            )}
            <ServerImageCleanup
              disabled={
                !(entry.hasPassword && entry.username) ||
                query.data?.status !== "OK" ||
                !query.data.images.some(
                  (row) => row.Repository === "<none>" && row.Tag === "<none>"
                )
              }
              entry={entry}
              onRefresh={async () => {
                await query.refetch();
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="min-w-0" size="none">
          {entry.hasPassword && entry.username ? null : (
            <p>{messages.servers.containers.credentialsRequired}</p>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <Button
                  onClick={() => query.refetch()}
                  size="sm"
                  variant="outline"
                >
                  {messages.servers.retry}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {!(query.data || error) &&
            entry.hasPassword &&
            entry.username &&
            (paused ? (
              <p>{messages.servers.metrics.paused}</p>
            ) : (
              <ServerImageListSkeleton />
            ))}
          {query.data?.status === "OK" && (
            <>
              {rows.length ? (
                <Table>
                  <TableHeader variant="sticky">
                    <TableRow>
                      {[
                        ["Repository", copy.repository],
                        ["Tag", copy.tag],
                        ["ID", copy.id],
                        ["Size", copy.size],
                        ["CreatedAt", copy.created],
                      ].map(([column, label]) => (
                        <ImageSortHead
                          active={sort === column}
                          descending={descending}
                          key={column}
                          label={label ?? ""}
                          onSort={() => sortBy(column ?? "Repository")}
                        />
                      ))}
                      <TableHead>
                        <span className="sr-only">{copy.inspect}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice((page - 1) * 20, page * 20).map((row) => (
                      <TableRow
                        key={`${row.ID}-${row.Repository}-${row.Tag}-${row.Digest}`}
                      >
                        <TableCell className="max-w-72">
                          <ImageRepository
                            repository={row.Repository ?? "<none>"}
                          />
                        </TableCell>
                        <TableCell className="max-w-56">
                          <Badge
                            className="max-w-full"
                            mono
                            radius="rounded"
                            variant="muted"
                          >
                            <span className="truncate" title={row.Tag}>
                              {row.Tag === "<none>" ? "—" : row.Tag}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell title={row.ID} variant="mono">
                          {row.ID?.replace("sha256:", "").slice(0, 12)}
                        </TableCell>
                        <TableCell>{row.Size}</TableCell>
                        <TableCell>
                          <ImageCreated
                            locale={locale}
                            value={row.CreatedAt ?? ""}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            aria-label={`${copy.inspect}: ${row.Repository}:${row.Tag}`}
                            render={
                              <Link
                                to={`/dashboard/server-metrics/${entry.id}/images/${encodeURIComponent(row.ID ?? "")}${detailParams.size ? `?${detailParams}` : ""}`}
                              />
                            }
                            size="sm"
                            variant="ghost"
                          >
                            {copy.inspect}
                            <ChevronRight data-icon="inline-end" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{copy.empty}</EmptyTitle>
                    <EmptyDescription>{copy.emptyHint}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {pages > 1 && (
                <div className="flex items-center justify-end gap-3">
                  <Button
                    disabled={page <= 1}
                    onClick={() => update("imagePage", String(page - 1))}
                    size="sm"
                    variant="outline"
                  >
                    {copy.previous}
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    {page} / {pages}
                  </span>
                  <Button
                    disabled={page >= pages}
                    onClick={() => update("imagePage", String(page + 1))}
                    size="sm"
                    variant="outline"
                  >
                    {copy.next}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
