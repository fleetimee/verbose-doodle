import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Play } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchSharedWheel, type SharedWheel } from "@/features/wheel/api";
import { WheelDisc } from "@/features/wheel/wheel-disc";
import { WheelQueryFeedback } from "@/features/wheel/wheel-load-failure";
import { WheelWinnerDialog } from "@/features/wheel/wheel-winner-dialog";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { copyToClipboard } from "@/lib/clipboard";

function SharedWheelReplay({ result }: { result: SharedWheel }) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const [index, setIndex] = useState<number | null>(null);
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sequence, setSequence] = useState(false);
  const [replay, setReplay] = useState(0);
  const draw = index === null ? null : result.draws[index];
  const busy = playing || sequence || winnerOpen;
  function start(at: number) {
    setIndex(at);
    setReplay((value) => value + 1);
    const automatic = result.draws[at].eligible.length === 1;
    setPlaying(!automatic);
    setWinnerOpen(automatic);
  }
  function stop() {
    setPlaying(false);
    setSequence(false);
  }
  function completed() {
    if (!playing) {
      return;
    }
    setPlaying(false);
    setWinnerOpen(true);
  }
  function continueReplay() {
    setWinnerOpen(false);
    if (sequence && index !== null && index + 1 < result.draws.length) {
      start(index + 1);
    } else {
      setSequence(false);
    }
  }
  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      {winnerOpen && draw && (
        <WheelWinnerDialog
          hasNext={
            sequence && index !== null && index + 1 < result.draws.length
          }
          name={result.entries[draw.winnerIndex]}
          number={draw.number}
          onClose={() => {
            setWinnerOpen(false);
            setSequence(false);
          }}
          onContinue={continueReplay}
        />
      )}
      <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
        <CardHeader size="panel" variant="panel">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>
            {copy.modes[result.mode]} · {copy.publicReadOnly}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
          <div className="wheel-stage grid h-72 min-h-48 place-items-center lg:h-auto lg:min-h-0 lg:flex-1">
            <WheelDisc
              draw={draw}
              eligible={
                draw?.eligible || result.entries.map((_, entry) => entry)
              }
              entries={result.entries}
              fit
              onComplete={completed}
              playing={playing}
              replay={replay}
            />
          </div>
          <div
            aria-live="polite"
            className="flex shrink-0 flex-col items-center gap-2 py-4 text-center"
          >
            <p className="text-muted-foreground text-xs">
              {playing ? copy.replaying : copy.completed}
            </p>
            <p className="max-w-full break-words font-semibold text-xl">
              {draw && !playing
                ? `${copy.draw} ${draw.number} · ${result.entries[draw.winnerIndex]}`
                : copy.replayReady}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                disabled={busy || result.draws.length === 0}
                onClick={() => {
                  setSequence(true);
                  start(0);
                }}
              >
                <Play data-icon="inline-start" />
                {copy.replaySession}
              </Button>
              {draw && (
                <Button
                  disabled={busy}
                  onClick={() => {
                    if (index !== null) {
                      start(index);
                    }
                  }}
                  variant="outline"
                >
                  {copy.replayDraw}
                </Button>
              )}
              {busy ? (
                <Button onClick={stop} variant="outline">
                  {copy.stopReplay}
                </Button>
              ) : (
                <Button
                  disabled={!draw}
                  onClick={() => setIndex(null)}
                  variant="ghost"
                >
                  {copy.backToBeginning}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {copy.savedBeforeAnimation}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
        <CardHeader size="panel" variant="panel">
          <CardTitle size="sm">{copy.results}</CardTitle>
          <CardDescription>
            {result.entries.length} {copy.entries} · {result.draws.length}{" "}
            {copy.draws}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
          <Tabs className="min-h-0 flex-1" defaultValue="results">
            <TabsList className="w-full">
              <TabsTrigger value="results">{copy.results}</TabsTrigger>
              <TabsTrigger value="entries">{copy.entries}</TabsTrigger>
            </TabsList>
            <TabsContent className="min-h-0" value="results">
              <ScrollArea className="h-48 lg:h-full">
                <div className="flex flex-col gap-2 py-2">
                  {result.draws.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {copy.noDraws}
                    </p>
                  )}
                  {result.draws.map((item, at) => (
                    <Button
                      aria-pressed={at === index}
                      className="w-full justify-start"
                      disabled={busy}
                      key={item.id}
                      onClick={() => {
                        setIndex(at);
                        setWinnerOpen(true);
                        setReplay((value) => value + 1);
                      }}
                      variant={at === index ? "secondary" : "ghost"}
                    >
                      <span className="shrink-0 font-mono text-xs">
                        #{item.number}
                      </span>
                      <span className="truncate">
                        {result.entries[item.winnerIndex]}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent className="min-h-0" value="entries">
              <ScrollArea className="h-48 lg:h-full">
                <ol className="flex list-inside list-decimal flex-col gap-2 py-2 text-sm">
                  {result.entries.map((entry) => (
                    <li className="break-words" key={entry}>
                      {entry}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <div className="flex shrink-0 flex-col gap-2 py-3">
            <p className="text-muted-foreground text-xs">{copy.hashTitle}</p>
            <code className="break-all text-xs">{result.hash}</code>
            <Button
              onClick={async () => {
                if (await copyToClipboard(result.hash)) {
                  toast.success(copy.hashCopied);
                } else {
                  toast.error(copy.hashCopyFailed);
                }
              }}
              size="sm"
              variant="outline"
            >
              {copy.copyHash}
            </Button>
            <p className="text-muted-foreground text-xs">
              {copy.publicEvidenceHint}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WheelResultPage() {
  const { token = "" } = useParams();
  const {
    messages: { wheel: copy },
  } = useI18n();
  const query = useQuery({
    queryKey: ["shared-wheel", token],
    queryFn: () => fetchSharedWheel(token),
    retry: false,
    refetchOnWindowFocus: false,
  });
  useDocumentMeta({
    title: `${query.data?.title || copy.sharedTitle} | Fleetime Labs`,
    description: copy.sharedHint,
  });
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.append(meta);
    const referrer = document.createElement("meta");
    referrer.name = "referrer";
    referrer.content = "no-referrer";
    document.head.append(referrer);
    return () => {
      meta.remove();
      referrer.remove();
    };
  }, []);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col gap-5 p-4 md:p-6 lg:h-dvh lg:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 font-medium text-muted-foreground text-sm">
            Fleetime Labs
          </p>
          <h1 className="break-words font-semibold text-2xl tracking-tight">
            {query.data?.title || copy.sharedTitle}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {copy.sharedHint}
          </p>
        </div>
      </header>
      {query.isPending && <Skeleton className="min-h-72 flex-1" />}
      <WheelQueryFeedback
        active
        cause={query.error}
        hasData={!!query.data}
        onRetry={() => query.refetch()}
        pending={query.isFetching}
        scope="shared"
      />
      {query.data && (
        <SharedWheelReplay key={query.data.hash} result={query.data} />
      )}
    </main>
  );
}
