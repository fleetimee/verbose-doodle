import { useState } from "react";
import {
  Activity,
  Check,
  CircleAlert,
  CircleDashed,
  CircleOff,
  ClipboardCopy,
  Eraser,
  MonitorDown,
  RadioReceiver,
  RefreshCw,
  Unplug,
} from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { useNfcBridge } from "@/features/developer-tools/tools/nfc-reader-inspector/hooks/use-nfc-bridge";
import type { NfcNdefRecord } from "@/features/developer-tools/tools/nfc-reader-inspector/types";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";

const connectionTone = {
  connected:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  connecting:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  reconnecting:
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

const NFC_BRIDGE_RELEASE_URL =
  "http://192.168.4.62/BPD_DIY_DEV_WEB_DASHBOARD/BILLER_SIMULATOR_JSON/releases/tag/v0.1.0";
const NFC_READER_TOUR_ID = "nfc-reader-inspector-intro";
const NFC_READER_TOUR_TARGETS = {
  bridge: "nfc-reader-tour-bridge",
  release: "nfc-reader-tour-release",
  scan: "nfc-reader-tour-scan",
  session: "nfc-reader-tour-session",
} as const;
const NFC_READER_TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: NFC_READER_TOUR_TARGETS.bridge,
    position: "bottom",
    title: messages.developerTools.nfcTour.bridgeTitle,
    description: messages.developerTools.nfcTour.bridgeDescription,
  },
  {
    selectorId: NFC_READER_TOUR_TARGETS.session,
    position: "bottom",
    title: messages.developerTools.nfcTour.sessionTitle,
    description: messages.developerTools.nfcTour.sessionDescription,
  },
  {
    selectorId: NFC_READER_TOUR_TARGETS.scan,
    position: "top",
    title: messages.developerTools.nfcTour.scanTitle,
    description: messages.developerTools.nfcTour.scanDescription,
  },
  {
    selectorId: NFC_READER_TOUR_TARGETS.release,
    position: "bottom",
    title: messages.developerTools.nfcTour.releaseTitle,
    description: messages.developerTools.nfcTour.releaseDescription,
  },
];

export function NfcReaderInspector() {
  const bridge = useNfcBridge();
  const copy = messages.developerTools;
  const isConnected = bridge.connectionStatus === "connected";
  const isConnectionPending =
    bridge.connectionStatus === "connecting" ||
    bridge.connectionStatus === "reconnecting";
  const isScanning = bridge.scanStatus === "scanning";
  const canControlScan = isConnected && bridge.readerState !== "unavailable";
  const connectionLabel =
    copy.nfcBridgeConnectionStates[bridge.connectionStatus];
  const readerLabel = copy.nfcReaderStates[bridge.readerState];
  let connectionButton: React.ReactNode;
  if (isConnected || isConnectionPending) {
    connectionButton = (
      <Button onClick={bridge.disconnect} type="button" variant="outline">
        <Unplug data-icon="inline-start" />
        {copy.nfcDisconnectBridge}
      </Button>
    );
  } else if (bridge.connectionStatus === "error") {
    connectionButton = (
      <Button onClick={bridge.refresh} type="button">
        <RefreshCw data-icon="inline-start" />
        {copy.nfcRetryBridge}
      </Button>
    );
  } else {
    connectionButton = (
      <Button onClick={bridge.connect} type="button">
        <RadioReceiver data-icon="inline-start" />
        {copy.nfcConnectBridge}
      </Button>
    );
  }

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
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Badge className="h-8 rounded-full px-3" variant="outline">
            {copy.nfcReaderTransport}
          </Badge>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <DeveloperToolTourButton
              label={copy.nfcTour.startButton}
              steps={NFC_READER_TOUR_STEPS}
              storageKey="nfc-reader-inspector-tour-seen"
              tourId={NFC_READER_TOUR_ID}
            />
            <a
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={NFC_BRIDGE_RELEASE_URL}
              id={NFC_READER_TOUR_TARGETS.release}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MonitorDown data-icon="inline-start" />
              {copy.nfcDownloadBridge}
            </a>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusCard
          icon={<Activity data-icon="inline-start" />}
          id={NFC_READER_TOUR_TARGETS.bridge}
          label={copy.nfcBridgeStatusLabel}
          tone={connectionTone[bridge.connectionStatus]}
          value={connectionLabel}
        >
          <p className="text-muted-foreground text-sm">
            {bridge.bridgeVersion
              ? `${copy.nfcBridgeVersionLabel}: ${bridge.bridgeVersion}`
              : copy.nfcBridgeNotConnected}
          </p>
          <div className="flex flex-wrap gap-2">{connectionButton}</div>
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

      <Card
        className="border-border/70 shadow-xs"
        id={NFC_READER_TOUR_TARGETS.scan}
      >
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <RadioReceiver data-icon="inline-start" />
            {copy.nfcScanTitle}
          </CardTitle>
          <div
            className="flex flex-wrap items-center gap-2"
            id={NFC_READER_TOUR_TARGETS.session}
          >
            <Badge variant="outline">
              {copy.nfcScanSessionLabel}:{" "}
              {copy.nfcScanSessionStates[bridge.scanStatus]}
            </Badge>
            {isScanning ? (
              <Button
                disabled={!canControlScan}
                onClick={bridge.stopScan}
                size="sm"
                type="button"
                variant="outline"
              >
                <CircleOff data-icon="inline-start" />
                {copy.nfcStopScan}
              </Button>
            ) : (
              <Button
                disabled={!canControlScan}
                onClick={bridge.startScan}
                size="sm"
                type="button"
              >
                <RadioReceiver data-icon="inline-start" />
                {copy.nfcStartScan}
              </Button>
            )}
            {bridge.latestScan && (
              <Button
                onClick={bridge.clearScan}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Eraser data-icon="inline-start" />
                {copy.nfcClearScan}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {bridge.latestScan ? (
            <ScanDetails scan={bridge.latestScan} />
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {copy.nfcScanEmpty}
            </p>
          )}
        </CardContent>
      </Card>

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

function ScanDetails({
  scan,
}: {
  readonly scan: NonNullable<ReturnType<typeof useNfcBridge>["latestScan"]>;
}) {
  const copy = messages.developerTools;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <ScanField
          action={
            scan.decodedText ? (
              <CopyButton label={copy.nfcCopyDecoded} text={scan.decodedText} />
            ) : undefined
          }
          label={copy.nfcScanDecodedLabel}
        >
          <p className="font-medium text-lg leading-relaxed">
            {scan.decodedText ?? copy.nfcScanNoDecodedText}
          </p>
        </ScanField>
        <ScanField label={copy.nfcScanDecodingStatusLabel}>
          <Badge variant="outline">
            {copy.nfcScanDecodingStatuses[scan.decodingStatus]}
          </Badge>
        </ScanField>
        <ScanField
          action={
            scan.uid ? (
              <CopyButton label={copy.nfcCopyUid} text={scan.uid} />
            ) : undefined
          }
          label={copy.nfcScanUidLabel}
        >
          <p className="font-mono text-sm">
            {scan.uid ?? copy.nfcScanUidUnavailable}
          </p>
        </ScanField>
        <ScanField label={copy.nfcScanTimestampLabel}>
          <time
            className="font-mono text-muted-foreground text-xs"
            dateTime={scan.timestamp}
          >
            {scan.timestamp}
          </time>
        </ScanField>
        {scan.warning && (
          <ScanField label={copy.nfcScanWarningLabel}>
            <p className="text-destructive text-sm">{scan.warning}</p>
          </ScanField>
        )}
      </div>
      <ScanField
        action={<CopyButton label={copy.nfcCopyRaw} text={scan.rawNdef} />}
        label={copy.nfcScanRawLabel}
      >
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-border/70 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
          <code>{scan.rawNdef}</code>
        </pre>
      </ScanField>
      <div className="space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
            {copy.nfcScanRecordsLabel}
          </p>
          <Badge variant="secondary">{scan.records.length}</Badge>
        </div>
        <div className="grid gap-3">
          {scan.records.map((record) => (
            <RecordDetails
              key={`${record.index}:${record.raw}`}
              record={record}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordDetails({ record }: { readonly record: NfcNdefRecord }) {
  const copy = messages.developerTools;
  return (
    <Card className="border-border/70 bg-muted/10 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
            {copy.nfcScanRecordLabel.replace(
              "{index}",
              String(record.index + 1)
            )}
          </p>
          <CardTitle className="mt-1 text-base">{record.type}</CardTitle>
        </div>
        <Badge variant="outline">
          {copy.nfcScanRecordTnfLabel} {record.tnf}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <RecordField label={copy.nfcScanRecordTypeLabel} value={record.type} />
        <RecordField
          label={copy.nfcScanRecordTypeHexLabel}
          monospace
          value={record.typeHex || "—"}
        />
        <RecordField
          label={copy.nfcScanRecordIdLabel}
          monospace={record.id !== null}
          value={record.id ?? copy.nfcScanRecordIdUnavailable}
        />
        <RecordField
          label={copy.nfcScanRecordIdHexLabel}
          monospace
          value={record.idHex || "—"}
        />
        <RecordField
          label={copy.nfcScanRecordPayloadLabel}
          value={record.payload ?? copy.nfcScanRecordPayloadUnavailable}
        />
        <RecordField
          label={copy.nfcScanRecordPayloadHexLabel}
          monospace
          value={record.payloadHex || "—"}
        />
        <RecordField
          action={<CopyButton label={copy.nfcCopyRecord} text={record.raw} />}
          label={copy.nfcScanRecordRawLabel}
          monospace
          value={record.raw}
        />
      </CardContent>
    </Card>
  );
}

function RecordField({
  action,
  label,
  monospace = false,
  value,
}: {
  readonly action?: React.ReactNode;
  readonly label: string;
  readonly monospace?: boolean;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
          {label}
        </p>
        {action}
      </div>
      <p
        className={`${monospace ? "font-mono" : ""} break-words text-sm leading-relaxed`}
      >
        {value}
      </p>
    </div>
  );
}

function CopyButton({
  label,
  text,
}: {
  readonly label: string;
  readonly text: string;
}) {
  const copy = messages.developerTools;
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    try {
      const copied = await copyToClipboard(text);
      setStatus(copied ? "copied" : "error");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 1500);
  };

  const Icon = status === "copied" ? Check : ClipboardCopy;
  let buttonLabel = label;
  if (status === "copied") {
    buttonLabel = copy.nfcCopied;
  } else if (status === "error") {
    buttonLabel = copy.nfcCopyFailed;
  }

  return (
    <Button
      aria-label={buttonLabel}
      onClick={handleCopy}
      size="icon-xs"
      title={label}
      type="button"
      variant="ghost"
    >
      <Icon />
      <span className="sr-only">{buttonLabel}</span>
    </Button>
  );
}

function ScanField({
  action,
  children,
  label,
}: {
  readonly action?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          {label}
        </p>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusCard({
  children,
  id,
  icon,
  label,
  tone,
  value,
}: {
  readonly children: React.ReactNode;
  readonly id?: string;
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly tone: string;
  readonly value: string;
}) {
  return (
    <Card className="border-border/70 shadow-xs" id={id}>
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
