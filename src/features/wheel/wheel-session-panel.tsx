import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Play, ShieldCheck } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  completeWheel,
  spinWheel,
  type WheelDraw,
  type WheelView,
} from "@/features/wheel/api";
import { WheelDisc } from "@/features/wheel/wheel-disc";
import { WheelSessionRecords } from "@/features/wheel/wheel-session-records";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getErrorMessage } from "@/lib/error-handler";
import { generateUUID } from "@/lib/utils";

function WheelOutcome({
  playing,
  replaying,
  draw,
  entries,
  completed,
}: {
  playing: boolean;
  replaying: boolean;
  draw: WheelDraw | null;
  entries: string[];
  completed: boolean;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const initialLabel = completed ? copy.completed : copy.ready;
  const initialTitle = completed ? copy.replayReady : copy.startHint;
  return (
    <div
      aria-live="polite"
      className="flex min-h-16 flex-col items-center justify-center gap-1 text-center"
    >
      {playing ? (
        <p className="text-muted-foreground text-sm">
          {replaying ? copy.replaying : copy.spinning}
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">
            {draw ? `${copy.draw} ${draw.number}` : initialLabel}
          </p>
          <p className="font-semibold text-2xl tracking-tight">
            {draw ? entries[draw.winnerIndex] : initialTitle}
          </p>
        </>
      )}
    </div>
  );
}

function wheelControls(
  view: WheelView,
  canManage: boolean,
  busy: boolean,
  requestId: string,
  draw: WheelDraw | null
) {
  const showSpin = canManage && (!view.seal || !!requestId);
  const showBeginning = !!view.seal && !!draw && !busy;
  const canSpin =
    canManage &&
    view.verified &&
    !busy &&
    (!!requestId || (!view.seal && view.draws.length < view.config.drawLimit));
  return { showSpin, showBeginning, canSpin };
}

export function WheelSessionPanel({
  view,
  canManage,
  onUpdate,
}: {
  view: WheelView;
  canManage: boolean;
  onUpdate: (view: WheelView) => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const [draw, setDraw] = useState<WheelDraw | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [replay, setReplay] = useState(0);
  const [sequence, setSequence] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useLocalStorage(
    `wheel-request-${view.config.id}`,
    "",
    {
      deserializer: (value) =>
        z.string().uuid().catch("").parse(JSON.parse(value)),
    }
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );
  const busy = pending || playing || sequence !== null;
  const removed = new Set(
    view.config.mode === "WITHOUT_REPLACEMENT"
      ? view.draws.map((value) => value.winnerIndex)
      : []
  );
  const allEntries = view.config.entries.map((_, index) => index);
  const remainingEntries = allEntries.filter((index) => !removed.has(index));
  const initialEntries = view.seal ? allEntries : remainingEntries;
  const eligible = draw?.eligible || initialEntries;
  const { showSpin, showBeginning, canSpin } = wheelControls(
    view,
    canManage,
    busy,
    requestId,
    draw
  );
  const startReplay = (item: WheelDraw) => {
    setDraw(item);
    setReplay((value) => value + 1);
    setPlaying(true);
  };
  async function spin() {
    const request = requestId || generateUUID();
    setRequestId(request);
    setPending(true);
    setError("");
    try {
      const saved = await spinWheel(view.config.id, request);
      onUpdate(saved);
      const result = saved.draws.find((item) => item.requestId === request);
      if (!(saved.verified && result)) {
        throw new Error(copy.integrityFailed);
      }
      setRequestId("");
      startReplay(result);
    } catch (cause) {
      const status = z.object({ status: z.number() }).safeParse(cause);
      if (status.success && [400, 403, 404].includes(status.data.status)) {
        setRequestId("");
      }
      setError(getErrorMessage(cause));
    } finally {
      setPending(false);
    }
  }
  function animationComplete() {
    if (!playing) {
      return;
    }
    setPlaying(false);
    if (sequence !== null && sequence + 1 < view.draws.length) {
      const next = sequence + 1;
      timer.current = setTimeout(() => {
        setSequence(next);
        startReplay(view.draws[next]);
      }, 900);
    } else {
      setSequence(null);
    }
  }
  if (!view.verified) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{copy.integrityFailedHint}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="grid min-h-0 min-w-0 flex-1 grid-rows-[minmax(0,1fr)_14rem] gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-1">
      <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
        <CardHeader size="panel" variant="panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{view.config.title}</CardTitle>
            <Badge variant="secondary">
              {view.seal ? copy.completed : copy.active}
            </Badge>
            <Badge variant="success">
              <ShieldCheck />
              {copy.verified}
            </Badge>
          </div>
          <CardDescription>
            {copy.modes[view.config.mode]} · {view.draws.length}/
            {view.config.drawLimit} {copy.draws} · {copy.locked}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
          <div className="wheel-stage grid min-h-0 flex-1 place-items-center">
            <WheelDisc
              draw={draw}
              eligible={eligible}
              entries={view.config.entries}
              fit
              onComplete={animationComplete}
              playing={playing}
              replay={replay}
            />
          </div>
          <Separator />
          <div className="shrink-0 py-3">
            <WheelOutcome
              completed={!!view.seal}
              draw={draw}
              entries={view.config.entries}
              playing={playing}
              replaying={sequence !== null}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!!requestId && !pending && (
              <p className="my-3 text-muted-foreground text-xs">
                {copy.retryHint}
              </p>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {showSpin && (
                <Button disabled={!canSpin} onClick={spin}>
                  {pending && <Spinner />}
                  {requestId ? copy.retryDraw : copy.spin}
                </Button>
              )}
              {draw && (
                <Button
                  disabled={!view.verified || busy || !draw}
                  onClick={() => {
                    if (draw) {
                      startReplay(draw);
                    }
                  }}
                  variant="outline"
                >
                  <Play data-icon="inline-start" />
                  {copy.replayDraw}
                </Button>
              )}
              {view.draws.length > 0 && (
                <Button
                  disabled={!view.verified || busy}
                  onClick={() => {
                    setSequence(0);
                    startReplay(view.draws[0]);
                  }}
                  variant={view.seal ? "default" : "outline"}
                >
                  <Play data-icon="inline-start" />
                  {copy.replaySession}
                </Button>
              )}
              {showBeginning && (
                <Button
                  onClick={() => {
                    setDraw(null);
                    setReplay((value) => value + 1);
                  }}
                  variant="ghost"
                >
                  {copy.backToBeginning}
                </Button>
              )}
              {sequence !== null && (
                <Button
                  onClick={() => {
                    if (timer.current) {
                      clearTimeout(timer.current);
                    }
                    setSequence(null);
                    setPlaying(false);
                  }}
                  variant="outline"
                >
                  {copy.stopReplay}
                </Button>
              )}
            </div>
            <p className="mt-3 text-center text-muted-foreground text-xs">
              {copy.savedBeforeAnimation}
            </p>
          </div>
        </CardContent>
      </Card>

      <WheelSessionRecords
        busy={busy}
        canManage={canManage}
        onComplete={async () => {
          setPending(true);
          try {
            onUpdate(await completeWheel(view.config.id));
          } catch (cause) {
            toast.error(getErrorMessage(cause));
          } finally {
            setPending(false);
          }
        }}
        onInspect={(item) => {
          setDraw(item);
          setReplay((value) => value + 1);
        }}
        requestId={requestId}
        selectedDraw={draw?.id}
        view={view}
      />
    </div>
  );
}
