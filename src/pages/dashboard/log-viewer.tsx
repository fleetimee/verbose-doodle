import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileTerminal, FileText, Plus } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  deleteLogSource,
  fetchLogCatalog,
  fetchLogSources,
  saveLogSource,
} from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import { LogErrorState } from "@/features/log-viewer/error-state";
import { LogStreamTabs } from "@/features/log-viewer/log-stream-tabs";
import {
  LogSourcesSkeleton,
  LogViewerSkeleton,
} from "@/features/log-viewer/log-viewer-skeleton";
import { SourceControls } from "@/features/log-viewer/source-controls";
import { SourceForm } from "@/features/log-viewer/source-form";
import { StreamViewer } from "@/features/log-viewer/stream-viewer";
import type { LogSource } from "@/features/log-viewer/types";
import { useLogViewerLocation } from "@/features/log-viewer/use-log-viewer-location";
import { useDocumentMeta } from "@/hooks/use-document-meta";

import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const SOURCES_KEY = ["log-sources"];

const EXPAND_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";
const EXPAND_DURATION_MS = 240;
const EXPAND_REDUCED_MS = 120;

function animateWorkspace(
  workspace: HTMLDivElement,
  keyframes: Keyframe[],
  duration: number,
  animationRef: React.RefObject<Animation | null>
) {
  animationRef.current?.cancel();
  const animation = workspace.animate(keyframes, {
    duration,
    easing: EXPAND_EASING,
  });
  animationRef.current = animation;
  return animation;
}

function useLogViewerDisplayMode(
  fullscreenFailedMessage: string,
  reduceMotion: boolean
) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const previousRectRef = useRef<DOMRect | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    setFullscreenSupported(document.fullscreenEnabled);
    const update = () =>
      setFullscreen(
        viewerRef.current !== null &&
          document.fullscreenElement === viewerRef.current
      );
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  useLayoutEffect(() => {
    const first = previousRectRef.current;
    const workspace = workspaceRef.current;
    if (!(first && workspace)) {
      return;
    }
    previousRectRef.current = null;
    if (reduceMotion) {
      const animation = animateWorkspace(
        workspace,
        [{ opacity: 0 }, { opacity: 1 }],
        EXPAND_REDUCED_MS,
        animationRef
      );
      animation.onfinish = () => {
        if (animationRef.current === animation) {
          animationRef.current = null;
          setRestoring(false);
        }
      };
      return;
    }
    const last = workspace.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;
    const animation = animateWorkspace(
      workspace,
      [
        {
          transformOrigin: "0 0",
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
        },
        {
          transformOrigin: "0 0",
          transform: "translate3d(0, 0, 0) scale(1, 1)",
        },
      ],
      EXPAND_DURATION_MS,
      animationRef
    );
    animation.onfinish = () => {
      if (animationRef.current === animation) {
        animationRef.current = null;
        setRestoring(false);
      }
    };
  }, [maximized, reduceMotion]);

  function toggleMaximized() {
    if (workspaceRef.current) {
      previousRectRef.current = workspaceRef.current.getBoundingClientRect();
    }
    if (maximized) {
      setRestoring(true);
      setMaximized(false);
    } else {
      setRestoring(false);
      setMaximized(true);
    }
  }

  useEffect(() => {
    if (!maximized || fullscreen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        animationRef.current?.cancel();
        animationRef.current = null;
        previousRectRef.current = null;
        setRestoring(false);
        setMaximized(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [maximized, fullscreen]);

  async function toggleFullscreen() {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    try {
      if (document.fullscreenElement === viewer) {
        await document.exitFullscreen();
      } else {
        await viewer.requestFullscreen();
      }
    } catch {
      toast.error(fullscreenFailedMessage);
    }
  }

  return {
    workspaceRef,
    viewerRef,
    fullscreen,
    fullscreenSupported,
    maximized,
    maximizedAttr: maximized ? true : undefined,
    restoringAttr: restoring ? true : undefined,
    toggleFullscreen,
    toggleMaximized,
  };
}

function MissingSourceState({
  dedicated,
  sourcesLoaded,
  sourceFound,
}: {
  dedicated: boolean;
  sourcesLoaded: boolean;
  sourceFound: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  if (!(dedicated && sourcesLoaded) || sourceFound) {
    return null;
  }
  return (
    <Empty className="flex-1" variant="bordered">
      <EmptyHeader>
        <EmptyTitle>{copy.sourceNotFound}</EmptyTitle>
        <EmptyDescription>{copy.sourceNotFoundHint}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function LogViewerPage() {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const reduceMotion = useReducedMotion();
  const {
    workspaceRef,
    viewerRef,
    fullscreen,
    fullscreenSupported,
    maximized,
    maximizedAttr,
    restoringAttr,
    toggleFullscreen,
    toggleMaximized,
  } = useLogViewerDisplayMode(copy.fullscreenFailed, Boolean(reduceMotion));
  const queryClient = useQueryClient();
  const {
    dedicated,
    selectedId,
    setSelectedId,
    from,
    setFrom,
    setRange,
    to,
    setTo,
    stream,
    setStream,
  } = useLogViewerLocation();
  const [editing, setEditing] = useState<LogSource | "new" | null>(null);
  const sources = useQuery({
    queryKey: SOURCES_KEY,
    queryFn: ({ signal }) => fetchLogSources(signal),
    retry: false,
  });
  const selected =
    sources.data?.find((source) => source.id === selectedId) ??
    sources.data?.find(() => !dedicated);
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
    title: [selected?.name, copy.title, "Fleetime Labs"]
      .filter(Boolean)
      .join(" | "),
    description: copy.description,
  });

  return (
    <div
      className="log-viewer-workspace mx-auto flex h-full min-h-0 w-full min-w-0 max-w-[1600px] flex-1 flex-col gap-3 overflow-hidden"
      data-maximized={maximizedAttr}
      data-restoring={restoringAttr}
      ref={workspaceRef}
    >
      <h1 className="sr-only">{copy.title}</h1>
      <MissingSourceState
        dedicated={dedicated}
        sourceFound={Boolean(selected)}
        sourcesLoaded={sources.isSuccess}
      />
      {sources.isPending && <LogSourcesSkeleton />}
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
      {!dedicated && sources.data?.length === 0 && (
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
          <div className="shrink-0" hidden={fullscreen}>
            <SourceControls
              catalog={catalog.data}
              checking={catalog.isFetching}
              deleting={remove.isPending}
              editing={editing !== null}
              failed={catalog.isError}
              from={from}
              onAdd={() => setEditing("new")}
              onCheck={() => catalog.refetch()}
              onDelete={() => remove.mutate(selected.id)}
              onEdit={() => setEditing(selected)}
              onSelect={setSelectedId}
              selected={selected}
              setFrom={setFrom}
              setRange={setRange}
              setTo={setTo}
              sources={sources.data ?? []}
              to={to}
            />
          </div>
          {catalog.error && catalog.data && (
            <Alert className="shrink-0" variant="destructive">
              <AlertTitle>{copy.error}</AlertTitle>
              <AlertDescription>
                {getErrorMessage(catalog.error)}
              </AlertDescription>
            </Alert>
          )}
          <div
            className="log-viewer-panel flex min-h-0 min-w-0 flex-1 flex-col"
            ref={viewerRef}
          >
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
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={`${selected.id}:${selected.updatedAt}:${from}:${to}:${catalog.isPending}`}
                    transition={{
                      duration: reduceMotion
                        ? MOTION_DURATION.instant
                        : MOTION_DURATION.fast,
                      ease: MOTION_EASE.out,
                    }}
                  >
                    {catalog.isPending && <LogViewerSkeleton />}
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
                          <EmptyDescription>
                            {copy.noFilesHint}
                          </EmptyDescription>
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
                        <LogStreamTabs
                          label={copy.streams}
                          streams={catalog.data?.streams ?? []}
                        />
                        <TabsContent
                          className="min-h-0 flex-1 overflow-hidden"
                          value={activeStream}
                        >
                          <AnimatePresence initial={false} mode="wait">
                            <motion.div
                              animate={{ opacity: 1 }}
                              className="flex h-full min-h-0 flex-col"
                              exit={{ opacity: 0 }}
                              initial={{ opacity: 0 }}
                              key={activeStream}
                              transition={{
                                duration: reduceMotion
                                  ? MOTION_DURATION.instant
                                  : MOTION_DURATION.fast,
                                ease: MOTION_EASE.out,
                              }}
                            >
                              <StreamViewer
                                from={from}
                                fullscreen={fullscreen}
                                fullscreenSupported={fullscreenSupported}
                                id={selected.id}
                                key={`${selected.id}:${selected.updatedAt}:${activeStream}:${from}:${to}`}
                                maximized={maximized}
                                onFullscreen={toggleFullscreen}
                                onMaximize={toggleMaximized}
                                stream={activeStream}
                                to={to}
                              />
                            </motion.div>
                          </AnimatePresence>
                        </TabsContent>
                      </Tabs>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
