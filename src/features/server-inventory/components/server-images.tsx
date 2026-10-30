import {
  Cancel01Icon,
  Layers01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiDocker } from "react-icons/si";
import { Link, useLocation, useSearchParams } from "react-router";
import { ChevronRight } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
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
  compareImages,
  ImageSortHead,
  ImageTablePagination,
  ImageTableShimmer,
  ImageTagBadge,
} from "@/features/server-inventory/components/server-image-table";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DOCKER_TIMEZONE = / ([+-]\d{2})(\d{2}) .*$/;

function ImageCreated({ value, locale }: { value: string; locale: string }) {
  const normalized = value.replace(DOCKER_TIMEZONE, "$1:$2").replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-xs">{value}</span>;
  }
  return (
    <div className="flex flex-col gap-0.5" title={value}>
      <span className="font-medium text-foreground/90 text-xs">
        {date.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
      <span className="text-muted-foreground/70 text-xs tabular-nums">
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
    <div className="flex min-w-0 items-center gap-3 py-1.5" title={repository}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
          untagged
            ? "border-border/80 border-dashed bg-muted/40 text-muted-foreground/70"
            : "border-border/60 bg-primary/10 text-primary"
        )}
      >
        {untagged ? (
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4"
            icon={Layers01Icon}
            strokeWidth={2}
          />
        ) : (
          <SiDocker aria-hidden="true" className="size-4" />
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            "truncate font-medium text-xs tracking-tight",
            untagged && "text-muted-foreground"
          )}
        >
          {name}
        </span>
        <span className="truncate text-muted-foreground/75 text-xs">
          {source}
        </span>
      </div>
    </div>
  );
}

function ImageSearchInput({
  value,
  isSearching,
  onChange,
  onCommit,
  onClear,
}: {
  value: string;
  isSearching: boolean;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onClear: () => void;
}) {
  const copy = useI18n().messages.servers.images;
  return (
    <div className="relative flex w-full items-center transition-all sm:w-60 focus-within:sm:w-72">
      <InputGroup size="compact">
        <InputGroupAddon align="inline-start">
          {isSearching ? (
            <Spinner size="sm" variant="muted" />
          ) : (
            <HugeiconsIcon
              aria-hidden="true"
              className="size-3.5 text-muted-foreground transition-colors group-focus-within/input-group:text-foreground"
              icon={Search01Icon}
              strokeWidth={2}
            />
          )}
        </InputGroupAddon>
        <InputGroupInput
          aria-label={copy.search}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onCommit(value);
            }
          }}
          placeholder={copy.search}
          value={value}
        />
        <AnimatePresence>
          {value && (
            <InputGroupAddon align="inline-end">
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <InputGroupButton
                  aria-label={copy.clearSearch}
                  onClick={onClear}
                  size="icon-xs"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-3"
                    icon={Cancel01Icon}
                    strokeWidth={2}
                  />
                </InputGroupButton>
              </motion.div>
            </InputGroupAddon>
          )}
        </AnimatePresence>
      </InputGroup>
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
  const urlSearch = params.get("imageSearch") ?? "";
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

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

  useEffect(() => {
    if (localSearch === debouncedSearch) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = window.setTimeout(() => {
      setDebouncedSearch(localSearch);
      update("imageSearch", localSearch);
      setIsSearching(false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [localSearch, debouncedSearch]);

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
  const searchFilter = debouncedSearch.trim().toLowerCase();
  const rows = (query.data?.images ?? []).filter((row) =>
    [row.Repository, row.Tag, row.ID].some((value) =>
      value?.toLowerCase().includes(searchFilter)
    )
  );
  rows.sort((left, right) => compareImages(left, right, sort, descending));
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
            <ImageSearchInput
              isSearching={isSearching}
              onChange={setLocalSearch}
              onClear={() => {
                setLocalSearch("");
                setDebouncedSearch("");
                update("imageSearch", "");
                setIsSearching(false);
              }}
              onCommit={(val) => {
                setDebouncedSearch(val);
                update("imageSearch", val);
                setIsSearching(false);
              }}
              value={localSearch}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {query.data?.status === "OK" && (
              <motion.p
                animate={{ opacity: 1 }}
                aria-live="polite"
                className="text-muted-foreground text-xs"
                initial={{ opacity: 0 }}
                key={rows.length}
                transition={{ duration: 0.15 }}
              >
                {formatMessage(copy.results, { count: rows.length })}
              </motion.p>
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
            <div className="flex min-h-[460px] flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-xs">
              <ImageTableShimmer active={isSearching} />
              <div
                className={cn(
                  "flex-1 transition-opacity duration-200",
                  isSearching && "opacity-60"
                )}
              >
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
                      <TableHead className="w-28 text-right">
                        <span className="sr-only">{copy.inspect}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.slice((page - 1) * 20, page * 20).map((row) => (
                        <TableRow
                          key={`${row.ID}-${row.Repository}-${row.Tag}-${row.Digest}`}
                        >
                          <TableCell className="max-w-72">
                            <ImageRepository
                              repository={row.Repository ?? "<none>"}
                            />
                          </TableCell>
                          <TableCell className="max-w-48">
                            <ImageTagBadge tag={row.Tag} />
                          </TableCell>
                          <TableCell title={row.ID}>
                            <span className="rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 font-mono text-muted-foreground/80 text-xs tracking-tight">
                              {row.ID?.replace("sha256:", "").slice(0, 12)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground/90 text-xs tabular-nums">
                              {row.Size}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ImageCreated
                              locale={locale}
                              value={row.CreatedAt ?? ""}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              aria-label={`${copy.inspect}: ${row.Repository}:${row.Tag}`}
                              className="group/btn h-7 px-2.5 text-muted-foreground text-xs transition-all hover:text-foreground active:scale-95"
                              render={
                                <Link
                                  to={`/dashboard/server-metrics/${entry.id}/images/${encodeURIComponent(row.ID ?? "")}${detailParams.size ? `?${detailParams}` : ""}`}
                                />
                              }
                              size="xs"
                              variant="ghost"
                            >
                              {copy.inspect}
                              <ChevronRight
                                className="size-3.5 transition-transform group-hover/btn:translate-x-0.5"
                                data-icon="inline-end"
                              />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="h-72 text-center" colSpan={6}>
                          <Empty>
                            <EmptyHeader>
                              <EmptyTitle>{copy.empty}</EmptyTitle>
                              <EmptyDescription>
                                {copy.emptyHint}
                              </EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <ImageTablePagination
                onPageChange={(nextPage) => {
                  update("imagePage", String(nextPage));
                  const prefersReducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
                  sectionRef.current?.scrollIntoView({
                    behavior: prefersReducedMotion ? "instant" : "smooth",
                    block: "start",
                  });
                }}
                page={page}
                pages={pages}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
