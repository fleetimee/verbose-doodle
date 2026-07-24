import {
  Activity,
  CircleAlert,
  CircleDashed,
  RadioReceiver,
  RefreshCw,
  Unplug,
} from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNfcBridge } from "@/features/developer-tools/tools/nfc-reader-inspector/hooks/use-nfc-bridge";
import { messages } from "@/lib/i18n";

const connectionTone = {
  connected:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  connecting:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  disconnected: "border-muted-foreground/25 bg-muted text-muted-foreground",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

const readerTone = {
  detected:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "tag-detected":
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  unavailable: "border-destructive/30 bg-destructive/10 text-destructive",
  waiting:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
} as const;

export function NfcReaderInspector() {
  const bridge = useNfcBridge();
  const copy = messages.developerTools;
  const isConnected = bridge.connectionStatus === "connected";
  const connectionLabel =
    copy.nfcBridgeConnectionStates[bridge.connectionStatus];
  const readerLabel = copy.nfcReaderStates[bridge.readerState];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <header className="grid gap-4 border-border/70 border-b pb-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            {copy.nfcReaderEyebrow}
          </p>
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">
            {copy.nfcReaderTitle}
          </h1>
          <p className="mt-3 max-w-[68ch] text-muted-foreground text-sm leading-relaxed md:text-base">
            {copy.nfcReaderDescription}
          </p>
        </div>
        <div className="flex items-end justify-start md:justify-end">
          <Badge className="h-8 rounded-full px-3" variant="outline">
            {copy.nfcReaderTransport}
          </Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusCard
          icon={<Activity data-icon="inline-start" />}
          label={copy.nfcBridgeStatusLabel}
          tone={connectionTone[bridge.connectionStatus]}
          value={connectionLabel}
        >
          <p className="text-muted-foreground text-sm">
            {bridge.bridgeVersion
              ? `${copy.nfcBridgeVersionLabel}: ${bridge.bridgeVersion}`
              : copy.nfcBridgeNotConnected}
          </p>
          <div className="flex flex-wrap gap-2">
            {isConnected ? (
              <Button
                onClick={bridge.disconnect}
                type="button"
                variant="outline"
              >
                <Unplug data-icon="inline-start" />
                {copy.nfcDisconnectBridge}
              </Button>
            ) : (
              <Button onClick={bridge.connect} type="button">
                <RadioReceiver data-icon="inline-start" />
                {copy.nfcConnectBridge}
              </Button>
            )}
            {bridge.connectionStatus === "error" && (
              <Button onClick={bridge.refresh} type="button" variant="outline">
                <RefreshCw data-icon="inline-start" />
                {copy.nfcRetryBridge}
              </Button>
            )}
          </div>
        </StatusCard>

        <StatusCard
          icon={<RadioReceiver data-icon="inline-start" />}
          label={copy.nfcReaderStatusLabel}
          tone={readerTone[bridge.readerState]}
          value={readerLabel}
        >
          <p className="text-muted-foreground text-sm">
            {bridge.readerName ?? copy.nfcReaderNotDetected}
          </p>
          {bridge.reason && (
            <p className="text-muted-foreground text-sm">{bridge.reason}</p>
          )}
        </StatusCard>
      </div>

      {(bridge.error || bridge.action) && (
        <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
          <CircleAlert
            className="mt-0.5 size-5 shrink-0"
            data-icon="inline-start"
          />
          <div className="space-y-1">
            {bridge.error && (
              <p className="font-medium text-sm">{bridge.error}</p>
            )}
            {bridge.action && <p className="text-sm">{bridge.action}</p>}
          </div>
        </div>
      )}

      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CircleDashed data-icon="inline-start" />
            {copy.nfcReaderNextStepTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed">
          {copy.nfcReaderNextStepDescription}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({
  children,
  icon,
  label,
  tone,
  value,
}: {
  readonly children: React.ReactNode;
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly tone: string;
  readonly value: string;
}) {
  return (
    <Card className="border-border/70 shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
            {label}
          </p>
          <CardTitle className="mt-2 flex items-center gap-2 text-xl">
            {icon}
            {value}
          </CardTitle>
        </div>
        <Badge
          className={`h-7 rounded-full border px-3 ${tone}`}
          variant="outline"
        >
          {value}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
