import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FileTerminal, FileText, Plus } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteLogSource,
  fetchLogCatalog,
  fetchLogSources,
  saveLogSource,
} from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import { LogErrorState } from "@/features/log-viewer/error-state";
import { SourceControls } from "@/features/log-viewer/source-controls";
import { SourceForm } from "@/features/log-viewer/source-form";
import { StreamViewer } from "@/features/log-viewer/stream-viewer";
import type { LogSource } from "@/features/log-viewer/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";

const SOURCES_KEY = ["log-sources"];

function initialDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function LogViewerPage() {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<LogSource | "new" | null>(null);
  const [from, setFrom] = useState(initialDate);
  const [to, setTo] = useState("");
  const [stream, setStream] = useState("");
  const sources = useQuery({
    queryKey: SOURCES_KEY,
    queryFn: ({ signal }) => fetchLogSources(signal),
    retry: false,
  });
  const selected =
    sources.data?.find((source) => source.id === selectedId) ??
    sources.data?.[0];
  const catalog = useQuery({
    queryKey: ["log-catalog", selected?.id, selected?.updatedAt, from, to],
    queryFn: ({ signal }) => {
      if (!selected) {
        throw new Error(copy.chooseSource);
      }
      return fetchLogCatalog(selected.id, from, to, signal);
    },
    enabled: !!selected && !!from,
    retry: false,
    refetchInterval: 30_000,
  });
  const activeStream = catalog.data?.streams.includes(stream)
    ? stream
    : catalog.data?.streams[0];
  const remove = useMutation({
    mutationFn: deleteLogSource,
    onSuccess: async () => {
      setSelectedId("");
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: SOURCES_KEY });
      toast.success(copy.deleted);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  useDocumentMeta({
    title: `${copy.title} | Fleetime Labs`,
    description: copy.description,
  });

  return (
    <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-[1600px] flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="font-semibold text-xl tracking-tight">{copy.title}</h1>
          <p className="sr-only">{copy.description}</p>
        </div>
        <Button
          disabled={editing !== null}
          onClick={() => setEditing("new")}
          size="sm"
        >
          <Plus data-icon="inline-start" />
          {copy.add}
        </Button>
      </div>
      {sources.isPending && (
        <div
          aria-label={copy.loading}
          className="flex min-h-0 flex-1 flex-col gap-3"
          role="status"
        >
          <Skeleton className="h-28 w-full shrink-0" variant="xl" />
          <Skeleton className="min-h-0 w-full flex-1" variant="xl" />
          <span className="sr-only">{copy.loading}</span>
        </div>
      )}
      {sources.error && !sources.data && (
        <LogErrorState
          error={sources.error}
          onRetry={() => sources.refetch()}
          retrying={sources.isFetching}
          scope="sources"
        />
      )}
      {sources.error && sources.data && (
        <Alert variant="destructive">
          <AlertTitle>{copy.sourcesErrorTitle}</AlertTitle>
          <AlertDescription>
            {getErrorMessage(sources.error)}
            <Button
              disabled={sources.isFetching}
              onClick={() => sources.refetch()}
              size="sm"
              variant="outline"
            >
              {copy.reloadSources}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {sources.data?.length === 0 && (
        <Empty className="min-h-0 flex-1 overflow-auto" variant="bordered">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTerminal />
            </EmptyMedia>
            <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
            <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" />
            {copy.add}
          </Button>
        </Empty>
      )}
      {editing !== null && (
        <SourceForm
          key={editing === "new" ? "new" : editing.id}
          onCancel={() => setEditing(null)}
          onSave={async (request) => {
            const saved = await saveLogSource(
              request,
              editing === "new" ? undefined : editing.id
            );
            setSelectedId(saved.id);
            setEditing(null);
            await queryClient.invalidateQueries({ queryKey: SOURCES_KEY });
            toast.success(copy.saved);
          }}
          source={editing === "new" ? null : editing}
        />
      )}
      {selected && (
        <>
          <SourceControls
            catalog={catalog.data}
            checking={catalog.isFetching}
            deleting={remove.isPending}
            editing={editing !== null}
            failed={catalog.isError}
            from={from}
            onCheck={() => catalog.refetch()}
            onDelete={() => remove.mutate(selected.id)}
            onEdit={() => setEditing(selected)}
            onSelect={(value) => {
              setSelectedId(value);
              setStream("");
            }}
            selected={selected}
            setFrom={setFrom}
            setTo={setTo}
            sources={sources.data ?? []}
            to={to}
          />
          {catalog.error && catalog.data && (
            <Alert className="shrink-0" variant="destructive">
              <AlertTitle>{copy.error}</AlertTitle>
              <AlertDescription>
                {getErrorMessage(catalog.error)}
              </AlertDescription>
            </Alert>
          )}
          <Card
            className="min-h-0 min-w-0 flex-1 overflow-hidden"
            size="none"
            variant="outline"
          >
            <CardHeader className="sr-only" size="none">
              <CardTitle size="sm" variant="inline">
                <FileTerminal
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                {copy.streams}
              </CardTitle>
              <CardDescription size="xs">{copy.streamHint}</CardDescription>
            </CardHeader>
            <CardContent
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              size="none"
            >
              {catalog.isPending && (
                <div
                  aria-label={copy.loading}
                  className="flex min-h-0 flex-1 flex-col gap-3 p-4"
                  role="status"
                >
                  <Skeleton className="h-8 w-72 max-w-full" />
                  <Skeleton className="min-h-0 w-full flex-1" />
                  <span className="sr-only">{copy.loading}</span>
                </div>
              )}
              {catalog.isError && !catalog.data && (
                <LogErrorState
                  error={catalog.error}
                  onConfigure={() => setEditing(selected)}
                  onRetry={() => catalog.refetch()}
                  retrying={catalog.isFetching}
                  scope="catalog"
                />
              )}
              {catalog.data?.streams.length === 0 && (
                <Empty className="min-h-0 flex-1 overflow-auto">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText />
                    </EmptyMedia>
                    <EmptyTitle>{copy.noFiles}</EmptyTitle>
                    <EmptyDescription>{copy.noFilesHint}</EmptyDescription>
                  </EmptyHeader>
                  <Button
                    onClick={() => setEditing(selected)}
                    size="sm"
                    variant="outline"
                  >
                    {copy.edit}
                  </Button>
                </Empty>
              )}
              {activeStream && (
                <Tabs
                  className="min-h-0 flex-1"
                  onValueChange={(value) => setStream(String(value))}
                  value={activeStream}
                  variant="flush"
                >
                  <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0 overflow-x-auto">
                      <TabsList aria-label={copy.streams} size="sm">
                        {catalog.data?.streams.map((type) => (
                          <TabsTrigger key={type} value={type}>
                            {type}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    {catalog.data && (
                      <Badge variant="secondary">
                        {catalog.data.files.length} {copy.fileCount}
                      </Badge>
                    )}
                  </div>
                  {catalog.data?.streams.map((type) => (
                    <TabsContent
                      className="min-h-0 flex-1 overflow-hidden"
                      key={type}
                      value={type}
                    >
                      {type === activeStream && (
                        <StreamViewer
                          from={from}
                          id={selected.id}
                          key={`${selected.id}:${selected.updatedAt}:${type}:${from}:${to}`}
                          stream={type}
                          to={to}
                        />
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
