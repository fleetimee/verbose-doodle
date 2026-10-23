import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/context";
import {
  createWheel,
  evidenceSchema,
  fetchWheel,
  fetchWheelSessions,
  verifyWheelEvidence,
  type WheelView,
} from "@/features/wheel/api";
import { CreateWheelDrawer } from "@/features/wheel/create-wheel-drawer";
import { WheelDisc } from "@/features/wheel/wheel-disc";
import { WheelSessionPanel } from "@/features/wheel/wheel-session-panel";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

export function WheelPage() {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const { snapshot } = useAuth();
  const admin = snapshot.user?.role === "ADMIN";
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [offset, setOffset] = useState(0);
  const [gridSize, setGridSize] = useState({
    columns: 3,
    rows: 2,
    capacity: 6,
  });
  const grid = useRef<HTMLDivElement>(null);
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const sessions = useQuery({
    queryKey: ["wheel-sessions", page],
    queryFn: () => fetchWheelSessions(page),
    retry: false,
  });
  const id = params.get("session") || "";
  useEffect(() => {
    const element = grid.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const columns = Math.max(
        1,
        Math.min(3, Math.floor(entry.contentRect.width / 260))
      );
      const rows = Math.max(
        1,
        Math.min(2, Math.floor(entry.contentRect.height / 280))
      );
      setGridSize({ columns, rows, capacity: columns * rows });
      setOffset(0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [id]);
  const selected = useQuery({
    queryKey: ["wheel-session", id],
    queryFn: () => fetchWheel(id),
    enabled: !!id,
    retry: false,
  });
  const update = (view: WheelView) => {
    client.setQueryData(["wheel-session", view.config.id], view);
    client.invalidateQueries({ queryKey: ["wheel-sessions"] });
  };
  const gridStyle: CSSProperties & {
    "--wheel-grid-columns": number;
    "--wheel-grid-rows": number;
  } = {
    "--wheel-grid-columns": gridSize.columns,
    "--wheel-grid-rows": gridSize.rows,
  };
  useDocumentMeta({
    title: `${copy.title} | Fleetime Labs`,
    description: copy.description,
  });
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {copy.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={verifying}
            onClick={() => input.current?.click()}
            variant="outline"
          >
            {copy.verifyFile}
          </Button>
          {admin && (
            <Button onClick={() => setCreating(true)}>
              <Plus data-icon="inline-start" />
              {copy.create}
            </Button>
          )}
        </div>
      </div>
      <input
        accept="application/json,.json"
        aria-label={copy.verifyFile}
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) {
            return;
          }
          if (file.size > 1_000_000) {
            toast.error(copy.fileTooLarge);
            return;
          }
          setVerifying(true);
          try {
            const evidence = evidenceSchema.parse(
              JSON.parse(await file.text())
            );
            if (!(await verifyWheelEvidence(evidence))) {
              toast.error(copy.fileInvalid);
              return;
            }
            const config = z
              .object({ id: z.string().uuid() })
              .parse(JSON.parse(evidence.configuration.payload));
            setParams({ session: config.id });
            await client.invalidateQueries({
              queryKey: ["wheel-session", config.id],
            });
            toast.success(copy.fileVerified);
          } catch {
            toast.error(copy.fileInvalid);
          } finally {
            setVerifying(false);
          }
        }}
        ref={input}
        type="file"
      />
      <div className="flex shrink-0 items-center justify-between gap-2">
        {id ? (
          <Button onClick={() => setParams({})} size="sm" variant="outline">
            {copy.backToSessions}
          </Button>
        ) : (
          <h2 className="font-medium text-sm">{copy.savedSessions}</h2>
        )}
        <div className="flex items-center gap-2">
          <Button
            aria-label={copy.refresh}
            onClick={() => {
              sessions.refetch();
              if (id) {
                selected.refetch();
              }
            }}
            size="icon-sm"
            title={copy.refresh}
            variant="outline"
          >
            <RefreshCw />
          </Button>
          {!id && (
            <>
              <Button
                disabled={page === 0 && offset === 0}
                onClick={() => {
                  if (offset > 0) {
                    setOffset(Math.max(0, offset - gridSize.capacity));
                  } else {
                    setPage((value) => value - 1);
                    setOffset(
                      Math.floor(24 / gridSize.capacity) * gridSize.capacity
                    );
                  }
                }}
                size="sm"
                variant="outline"
              >
                {copy.previous}
              </Button>
              <Button
                disabled={
                  !sessions.data ||
                  (offset + gridSize.capacity >= sessions.data.items.length &&
                    page + 1 >= sessions.data.totalPages)
                }
                onClick={() => {
                  if (
                    sessions.data &&
                    offset + gridSize.capacity < sessions.data.items.length
                  ) {
                    setOffset((value) => value + gridSize.capacity);
                  } else {
                    setPage((value) => value + 1);
                    setOffset(0);
                  }
                }}
                size="sm"
                variant="outline"
              >
                {copy.next}
              </Button>
            </>
          )}
        </div>
      </div>
      {sessions.error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(sessions.error)}</AlertDescription>
        </Alert>
      )}
      {selected.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {getErrorMessage(selected.error)}
            <Button onClick={() => selected.refetch()} variant="outline">
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {(sessions.isPending || selected.isFetching) && (
        <Skeleton className="h-12 w-full" />
      )}
      {id && selected.data && (
        <WheelSessionPanel
          canManage={admin}
          key={selected.data.config.id}
          onUpdate={update}
          view={selected.data}
        />
      )}
      {!id && (
        <div className="min-h-0 flex-1" ref={grid}>
          {!!sessions.data?.items.length && (
            <div
              className="grid h-full grid-cols-[repeat(var(--wheel-grid-columns),minmax(0,1fr))] grid-rows-[repeat(var(--wheel-grid-rows),minmax(0,1fr))] gap-4"
              style={gridStyle}
            >
              {sessions.data.items
                .slice(offset, offset + gridSize.capacity)
                .map((session) => (
                  <button
                    className="group flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-left shadow-xs transition-shadow duration-200 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none"
                    key={session.id}
                    onClick={() => setParams({ session: session.id })}
                    title={session.title}
                    type="button"
                  >
                    <div
                      aria-hidden="true"
                      className="wheel-stage relative grid min-h-0 w-full flex-1 place-items-center bg-muted/20 p-3"
                    >
                      <div className="absolute top-3 right-3 z-10">
                        <Badge
                          variant={session.completed ? "secondary" : "success"}
                        >
                          {session.completed ? copy.completed : copy.active}
                        </Badge>
                      </div>
                      <WheelDisc
                        draw={null}
                        eligible={session.entries.map((_, index) => index)}
                        entries={session.entries}
                        fit
                        playing={false}
                        replay={0}
                      />
                    </div>
                    <div className="flex w-full shrink-0 flex-col gap-2 border-t p-4">
                      <span className="truncate font-semibold text-base tracking-tight group-hover:text-primary">
                        {session.title}
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        {copy.modes[session.mode]} ·{" "}
                        {session.completed ? copy.completed : copy.active}
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
                        <span>
                          {session.entryCount} {copy.entries} ·{" "}
                          {session.drawCount} {copy.draws}
                        </span>
                        <time dateTime={session.createdAt}>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
          {!(
            sessions.data?.items.length ||
            sessions.isPending ||
            sessions.error
          ) && (
            <Empty variant="bordered">
              <EmptyHeader>
                <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                <EmptyDescription>
                  {admin ? copy.emptyHint : copy.readOnlyHint}
                </EmptyDescription>
              </EmptyHeader>
              {admin && (
                <Button onClick={() => setCreating(true)}>{copy.create}</Button>
              )}
            </Empty>
          )}
        </div>
      )}
      {creating && (
        <CreateWheelDrawer
          onClose={() => setCreating(false)}
          onCreate={async (request) => {
            const view = await createWheel(request);
            update(view);
            setParams({});
            setPage(0);
            setOffset(0);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}
