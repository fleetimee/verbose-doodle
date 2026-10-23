import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
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
  fetchWheel,
  fetchWheelSessions,
  type WheelView,
} from "@/features/wheel/api";
import { CreateWheelDrawer } from "@/features/wheel/create-wheel-drawer";
import { WheelDetailSkeleton } from "@/features/wheel/wheel-detail-skeleton";
import { WheelDisc } from "@/features/wheel/wheel-disc";
import { WheelQueryFeedback } from "@/features/wheel/wheel-load-failure";
import { WheelSessionPanel } from "@/features/wheel/wheel-session-panel";
import { useDocumentMeta } from "@/hooks/use-document-meta";

function WheelToolbar({
  admin,
  selected,
  refreshing,
  onBack,
  onRefresh,
  onCreate,
}: {
  admin: boolean;
  selected: boolean;
  refreshing: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {selected && (
          <Button
            aria-label={copy.backToSessions}
            onClick={onBack}
            size="icon-sm"
            title={copy.backToSessions}
            variant="ghost"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
        )}
        <div>
          <h1 className="font-semibold text-xl tracking-tight">{copy.title}</h1>
          {!selected && (
            <p className="mt-1 text-muted-foreground text-sm">
              {copy.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-label={copy.refresh}
          disabled={refreshing}
          onClick={onRefresh}
          size="icon-sm"
          title={copy.refresh}
          variant="ghost"
        >
          <RefreshCw />
        </Button>
        {admin && (
          <Button
            onClick={onCreate}
            size="sm"
            variant={selected ? "outline" : "default"}
          >
            <Plus data-icon="inline-start" />
            {copy.create}
          </Button>
        )}
      </div>
    </header>
  );
}

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
      <WheelToolbar
        admin={admin}
        onBack={() => setParams({})}
        onCreate={() => setCreating(true)}
        onRefresh={() => {
          sessions.refetch();
          if (id) {
            selected.refetch();
          }
        }}
        refreshing={sessions.isFetching || selected.isFetching}
        selected={!!id}
      />
      {!id && (
        <div className="flex shrink-0 items-center justify-between gap-2">
          <h2 className="font-medium text-sm">{copy.savedSessions}</h2>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}
      <WheelQueryFeedback
        active={!!id}
        cause={selected.error}
        hasData={!!selected.data}
        onBack={() => setParams({})}
        onRetry={() => selected.refetch()}
        pending={selected.isFetching}
        scope="detail"
      />
      {id && !selected.data && selected.isPending && <WheelDetailSkeleton />}
      {id && selected.data && (
        <div
          className="wheel-view-enter flex min-h-0 flex-1 flex-col"
          key={selected.data.config.id}
        >
          <WheelSessionPanel
            canManage={admin}
            key={selected.data.config.id}
            onUpdate={update}
            view={selected.data}
          />
        </div>
      )}
      {!id && (
        <div
          className="wheel-view-enter flex min-h-0 flex-1 flex-col gap-3"
          ref={grid}
        >
          <WheelQueryFeedback
            active={!id}
            cause={sessions.error}
            hasData={!!sessions.data}
            onRetry={() => sessions.refetch()}
            pending={sessions.isFetching}
            scope="grid"
          />

          {sessions.isPending && (
            <div
              aria-busy="true"
              className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <Skeleton className="h-full w-full" variant="xl" />
              <Skeleton
                className="hidden h-full w-full sm:block"
                variant="xl"
              />
              <Skeleton
                className="hidden h-full w-full lg:block"
                variant="xl"
              />
            </div>
          )}
          {!!sessions.data?.items.length && (
            <div
              className="grid min-h-0 flex-1 grid-cols-[repeat(var(--wheel-grid-columns),minmax(0,1fr))] grid-rows-[repeat(var(--wheel-grid-rows),minmax(0,1fr))] gap-4"
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
