import { useI18n } from "@/components/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadWheelEvidence,
  type WheelDraw,
  type WheelView,
} from "@/features/wheel/api";
import { WheelFingerprint } from "@/features/wheel/wheel-fingerprint";
import { WheelShare } from "@/features/wheel/wheel-share";

export function WheelSessionRecords({
  view,
  canManage,
  busy,
  requestId,
  selectedDraw,
  onInspect,
  onComplete,
}: {
  view: WheelView;
  canManage: boolean;
  busy: boolean;
  requestId: string;
  selectedDraw?: string;
  onInspect: (draw: WheelDraw) => void;
  onComplete: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  return (
    <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
      <CardHeader size="panel" variant="panel">
        <div className="flex items-center justify-between gap-2">
          <CardTitle size="sm">{copy.sessionDetails}</CardTitle>
          <span className="text-muted-foreground text-xs">
            {view.draws.length}/{view.config.drawLimit} {copy.draws}
          </span>
        </div>
        <CardDescription>
          {copy.locked} · {view.config.entries.length} {copy.entries}
        </CardDescription>
        <Progress
          aria-label={copy.draws}
          value={(view.draws.length / view.config.drawLimit) * 100}
        />
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
        <Tabs className="min-h-0 flex-1" defaultValue="history">
          <TabsList className="w-full" size="sm">
            <TabsTrigger size="sm" value="history">
              {copy.history}
            </TabsTrigger>
            <TabsTrigger size="sm" value="entries">
              {copy.entries}
            </TabsTrigger>
            <TabsTrigger size="sm" value="evidence">
              {copy.evidenceTab}
            </TabsTrigger>
          </TabsList>
          <TabsContent className="min-h-0 overflow-hidden" value="history">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 py-2">
                <p className="mb-1 text-muted-foreground text-xs">
                  {copy.historyHint}
                </p>
                {view.draws.length === 0 && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>{copy.noDraws}</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
                {view.draws.map((item) => (
                  <Button
                    aria-pressed={selectedDraw === item.id}
                    className="w-full justify-start"
                    disabled={busy || !view.verified}
                    key={item.id}
                    onClick={() => onInspect(item)}
                    variant={selectedDraw === item.id ? "secondary" : "ghost"}
                  >
                    <span className="shrink-0 font-mono text-xs">
                      #{item.number}
                    </span>
                    <span className="truncate">
                      {view.config.entries[item.winnerIndex]}
                    </span>
                    <span className="ml-auto shrink-0 text-xs">
                      {new Date(item.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent className="min-h-0 overflow-hidden" value="entries">
            <ScrollArea className="h-full">
              <ol className="flex flex-col gap-3 py-3">
                {view.config.entries.map((entry, index) => (
                  <li
                    className="flex items-center gap-3 text-sm"
                    key={`${index}:${entry}`}
                  >
                    <svg
                      aria-hidden="true"
                      className="size-3 shrink-0"
                      viewBox="0 0 12 12"
                    >
                      <circle
                        cx="6"
                        cy="6"
                        fill={`var(--wheel-color-${(index % 8) + 1})`}
                        r="6"
                      />
                    </svg>
                    <span className="break-words">{entry}</span>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          </TabsContent>
          <TabsContent className="min-h-0 overflow-hidden" value="evidence">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 py-5 pr-4">
                {canManage && view.seal && (
                  <section>
                    <WheelShare
                      disabled={busy || !view.verified}
                      id={view.config.id}
                    />
                  </section>
                )}
                <p className="text-muted-foreground text-xs">{copy.verified}</p>
                <Separator />
                <section>
                  <WheelFingerprint view={view} />
                </section>
                <Separator />
                <dl className="grid gap-4 text-xs">
                  <div className="grid gap-1">
                    <dt className="text-muted-foreground">{copy.createdBy}</dt>
                    <dd>{view.config.createdBy}</dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-muted-foreground">{copy.createdAt}</dt>
                    <dd>{new Date(view.config.createdAt).toLocaleString()}</dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-muted-foreground">{copy.sessionId}</dt>
                    <dd className="break-all font-mono">{view.config.id}</dd>
                  </div>
                </dl>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="flex shrink-0 flex-col gap-3 pt-5">
          <Button
            disabled={!(view.verified && view.seal) || busy}
            onClick={() => downloadWheelEvidence(view)}
            title={view.seal ? copy.exportEvidence : copy.completeFirst}
            variant="outline"
          >
            {copy.exportEvidence}
          </Button>
          {canManage && !view.seal && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    disabled={busy || !!requestId || !view.verified}
                    variant="outline"
                  />
                }
              >
                {copy.complete}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{copy.completeTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {copy.completeHint}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={onComplete}>
                    {copy.complete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
