import {
  ActivityIcon,
  Clock01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Binary, FileJson, Hash } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { TrafficLogEntry } from "@/features/socket-tester/types";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type HexInspectorProps = {
  readonly entry: TrafficLogEntry | null;
  readonly onOpenChange: (open: boolean) => void;
};

const BYTE_COLUMNS = 16;
const textEncoder = new TextEncoder();

const directionTone: Record<TrafficLogEntry["direction"], string> = {
  err: "border-destructive/30 bg-destructive/10 text-destructive",
  in: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  out: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  sys: "border-muted-foreground/25 bg-muted text-muted-foreground",
};

function toHexRows(bytes: Uint8Array) {
  const rows: string[] = [];

  for (let index = 0; index < bytes.length; index += BYTE_COLUMNS) {
    const slice = bytes.slice(index, index + BYTE_COLUMNS);
    const offset = index.toString(16).padStart(4, "0");
    const hex = Array.from(slice)
      .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
      .join(" ")
      .padEnd(47, " ");
    const ascii = Array.from(slice)
      .map((byte) =>
        byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "."
      )
      .join("");
    rows.push(`${offset}  ${hex}  ${ascii}`);
  }

  return rows.length > 0 ? rows : ["0000"];
}

function getRenderedData(value: string) {
  try {
    return {
      content: JSON.stringify(JSON.parse(value), null, 2),
      description: messages.socketTester.renderedJsonDescription,
      label: messages.socketTester.copyRenderedJsonLabel,
      toastMessage: messages.socketTester.renderedJsonCopied,
    };
  } catch {
    return {
      content: value,
      description: messages.socketTester.renderedDataDescription,
      label: messages.socketTester.copyRenderedDataLabel,
      toastMessage: messages.socketTester.renderedDataCopied,
    };
  }
}

export function HexInspector({ entry, onOpenChange }: HexInspectorProps) {
  const open = Boolean(entry);
  const payloadBytes = useMemo(
    () => (entry ? textEncoder.encode(entry.data) : new Uint8Array()),
    [entry?.data]
  );
  const hexDump = useMemo(
    () => (entry ? toHexRows(payloadBytes).join("\n") : ""),
    [entry, payloadBytes]
  );
  const metadata = useMemo(
    () =>
      entry?.metadata
        ? JSON.stringify(entry.metadata, null, 2)
        : messages.socketTester.metadataEmpty,
    [entry?.metadata]
  );
  const payloadSize = payloadBytes.length;
  const renderedData = useMemo(
    () => (entry ? getRenderedData(entry.data) : null),
    [entry?.data]
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[88vh] overflow-hidden border-border/70 bg-background p-0 text-foreground shadow-2xl sm:max-w-5xl">
        {entry && (
          <div className="flex max-h-[88vh] min-h-0 flex-col">
            <div className="border-border/70 border-b bg-muted/30 px-6 py-5">
              <DialogHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                  <div className="min-w-0">
                    <DialogTitle className="flex items-center gap-2 font-semibold text-xl tracking-tight">
                      <span className="flex size-9 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                        <Binary data-icon="inline-start" />
                      </span>
                      {messages.socketTester.frameInspectorTitle}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {messages.socketTester.frameInspectorDescription}
                    </DialogDescription>
                  </div>
                  <Badge
                    className={cn(
                      "h-7 gap-1.5 border font-mono uppercase",
                      directionTone[entry.direction]
                    )}
                    variant="outline"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={ActivityIcon}
                      strokeWidth={2}
                    />
                    {entry.direction}
                  </Badge>
                </div>
              </DialogHeader>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="grid gap-5 p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <InspectorStat
                    icon={
                      <HugeiconsIcon
                        data-icon="inline-start"
                        icon={Clock01Icon}
                        strokeWidth={2}
                      />
                    }
                    label={messages.socketTester.timestampLabel}
                    value={entry.timestamp}
                  />
                  <InspectorStat
                    icon={<Hash data-icon="inline-start" />}
                    label={messages.socketTester.protocolLabel}
                    value={entry.protocol}
                  />
                  <InspectorStat
                    label={messages.socketTester.scopeLabel}
                    value={entry.scope}
                  />
                  <InspectorStat
                    label={messages.socketTester.formatLabel}
                    value={entry.format}
                  />
                  <InspectorStat
                    label={messages.socketTester.bytesLabel}
                    value={String(payloadSize)}
                  />
                </div>

                <ResizablePanelGroup
                  className="min-h-[620px] overflow-hidden rounded-lg border border-border/70 bg-card shadow-xs"
                  direction="horizontal"
                >
                  <ResizablePanel defaultSize={52} minSize={34}>
                    <FramePane
                      description={
                        messages.socketTester.renderedReplyDescription
                      }
                      icon={<FileJson data-icon="inline-start" />}
                      title={messages.socketTester.dataTitle}
                    >
                      {renderedData ? (
                        <InspectorBlock
                          action={
                            <CopyButton
                              label={renderedData.label}
                              text={renderedData.content}
                              toastMessage={renderedData.toastMessage}
                            />
                          }
                          description={renderedData.description}
                          title={messages.socketTester.renderedDataTitle}
                        >
                          <CodeSurface
                            className="max-h-[300px]"
                            tone="rendered"
                          >
                            {renderedData.content}
                          </CodeSurface>
                        </InspectorBlock>
                      ) : null}

                      <InspectorBlock
                        action={
                          <CopyButton
                            label={messages.socketTester.copyPayloadLabel}
                            text={entry.data}
                            toastMessage={messages.socketTester.payloadCopied}
                          />
                        }
                        description={
                          messages.socketTester.rawPayloadDescription
                        }
                        title={messages.socketTester.rawPayloadTitle}
                      >
                        <CodeSurface className="max-h-[260px]" tone="payload">
                          {entry.data}
                        </CodeSurface>
                      </InspectorBlock>
                    </FramePane>
                  </ResizablePanel>
                  <ResizableHandle
                    className="w-1 bg-border transition-colors hover:bg-primary/60"
                    withHandle
                  />
                  <ResizablePanel defaultSize={48} minSize={34}>
                    <FramePane
                      description={
                        messages.socketTester.frameContextDescription
                      }
                      icon={<Binary data-icon="inline-start" />}
                      title={messages.socketTester.frameContextTitle}
                    >
                      <InspectorBlock
                        action={
                          <CopyButton
                            label={messages.socketTester.copyHexLabel}
                            text={hexDump}
                            toastMessage={messages.socketTester.hexDumpCopied}
                          />
                        }
                        description={messages.socketTester.hexDumpDescription}
                        title={messages.socketTester.hexDumpTitle}
                      >
                        <CodeSurface className="max-h-[300px]" tone="hex">
                          {hexDump}
                        </CodeSurface>
                      </InspectorBlock>

                      <InspectorBlock
                        action={
                          <CopyButton
                            label={messages.socketTester.copyMetadataLabel}
                            text={metadata}
                            toastMessage={messages.socketTester.metadataCopied}
                          />
                        }
                        description={messages.socketTester.metadataDescription}
                        title={messages.socketTester.metadataTitle}
                      >
                        <CodeSurface className="max-h-[260px]" tone="metadata">
                          {metadata}
                        </CodeSurface>
                      </InspectorBlock>
                    </FramePane>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InspectorStat({
  icon,
  label,
  value,
}: {
  readonly icon?: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
      <p className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
        {icon}
        {label}
      </p>
      <p className="mt-2 truncate font-mono font-semibold text-foreground text-sm">
        {value}
      </p>
    </div>
  );
}

function FramePane({
  children,
  description,
  icon,
  title,
}: {
  readonly children: React.ReactNode;
  readonly description: string;
  readonly icon: React.ReactNode;
  readonly title: string;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-border/70 border-b bg-muted/20 px-4 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold text-sm">
            <span className="text-primary">{icon}</span>
            {title}
          </h3>
          <p className="mt-1 text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-4">{children}</div>
      </ScrollArea>
    </section>
  );
}

function InspectorBlock({
  action,
  children,
  description,
  title,
}: {
  readonly action: React.ReactNode;
  readonly children: React.ReactNode;
  readonly description: string;
  readonly title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="mt-1 text-muted-foreground text-xs">{description}</p>
        </div>
        {action}
      </div>
      <Separator />
      <div className="p-4">{children}</div>
    </section>
  );
}

function CodeSurface({
  children,
  className,
  tone,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly tone: "hex" | "metadata" | "payload" | "rendered";
}) {
  return (
    <pre
      className={cn(
        "max-h-64 overflow-auto rounded-md border border-border/70 bg-muted/40 p-4 font-mono text-xs leading-relaxed shadow-inner",
        "dark:bg-zinc-950/70",
        tone === "payload" &&
          "text-emerald-700 selection:bg-emerald-500/20 dark:text-emerald-300",
        tone === "hex" &&
          "text-sky-700 selection:bg-sky-500/20 dark:text-sky-300",
        tone === "metadata" && "text-muted-foreground selection:bg-primary/20",
        tone === "rendered" &&
          "text-foreground selection:bg-primary/20 dark:text-zinc-100",
        className
      )}
    >
      {children}
    </pre>
  );
}

function CopyButton({
  label,
  text,
  toastMessage,
}: {
  readonly label: string;
  readonly text: string;
  readonly toastMessage: string;
}) {
  return (
    <Button
      className="h-8"
      onClick={() => {
        copyToClipboard(text)
          .then((copied) => {
            if (copied) {
              toast.success(toastMessage);
              return;
            }
            toast.error(messages.socketTester.unableToCopy);
          })
          .catch(() => toast.error(messages.socketTester.unableToCopy));
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      <HugeiconsIcon
        data-icon="inline-start"
        icon={Copy01Icon}
        strokeWidth={2}
      />
      {label}
    </Button>
  );
}
