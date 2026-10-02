import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCopy, Info } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  CPM_SAMPLE,
  CPM_SAMPLE_HEX,
  type CpmEncoding,
  parseCpm,
  type TlvNode,
} from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";
import {
  renderQrisPng,
  renderQrisQr,
} from "@/features/developer-tools/tools/qris-creator/render-qris-qr";
import { QrImageInput } from "@/features/developer-tools/tools/qris-parser/components/qr-image-input";
import { TapInspectionOutput } from "@/features/developer-tools/tools/qris-tap-parser/components/tap-inspection-output";
import {
  parseTap,
  TAP_SAMPLE,
  TAP_SAMPLE_HEX,
} from "@/features/developer-tools/tools/qris-tap-parser/parse-tap";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function CopyButton({
  value,
  label,
  className,
}: {
  readonly value: string;
  readonly label?: string;
  readonly className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const ok = await copyToClipboard(value);
      if (ok) {
        setCopied(true);
        toast.success(
          label
            ? formatMessage(messages.developerTools.qrisCpm.copiedNamed, {
                name: label,
              })
            : messages.developerTools.qrisCpm.copied
        );
        setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error(messages.developerTools.qrisCpm.copyFailed);
      }
    } catch {
      toast.error(messages.developerTools.qrisCpm.copyFailed);
    }
  };

  return (
    <Button
      aria-label={
        label ? `Copy ${label}` : messages.developerTools.qrisCpm.copyValue
      }
      className={cn(
        "size-6 shrink-0 text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleCopy}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      {copied ? (
        <Check className="size-3 text-primary" />
      ) : (
        <ClipboardCopy className="size-3" />
      )}
    </Button>
  );
}

function download(src: string, filename: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  link.click();
}

type TlvLikeNode = {
  readonly tag: string;
  readonly value_ascii?: string;
  readonly value_bcd?: string;
  readonly value_hex?: string;
  readonly children?: readonly TlvLikeNode[];
};

function findTlvValue(
  nodes: readonly TlvLikeNode[],
  tag: string
): string | undefined {
  for (const node of nodes) {
    if (node.tag === tag) {
      return node.value_ascii ?? node.value_bcd ?? node.value_hex;
    }
    if (node.children) {
      const found = findTlvValue(node.children, tag);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

function CpmSummary({
  result,
  qrPayload,
  qrSrc,
  mode,
}: {
  readonly result: {
    readonly tlv: readonly TlvLikeNode[];
  };
  readonly qrPayload: string | null;
  readonly qrSrc?: string | null;
  readonly mode: "cpm" | "tap";
}) {
  const copy =
    mode === "tap"
      ? messages.developerTools.qrisTap
      : messages.developerTools.qrisCpm;
  const [savingPng, setSavingPng] = useState(false);

  const cardholder = findTlvValue(result.tlv, "5F20");
  const cpan = findTlvValue(result.tlv, "5A");
  const appLabel = findTlvValue(result.tlv, "50");
  const format = findTlvValue(result.tlv, "85");

  return (
    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center">
      {qrSrc && qrPayload ? (
        <div className="flex shrink-0 justify-center">
          <Dialog>
            <DialogTrigger
              aria-label={copy.viewQr}
              className="group relative cursor-pointer rounded-md border bg-white p-1 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <img
                alt={copy.scan}
                className="size-24 shrink-0 rounded-sm"
                height={96}
                src={qrSrc}
                width={96}
              />
            </DialogTrigger>
            <DialogContent
              className="flex flex-col items-center gap-4 text-center"
              size="sm"
            >
              <DialogHeader className="items-center text-center">
                <DialogTitle className="font-semibold text-base">
                  {cardholder || appLabel || copy.title}
                </DialogTitle>
                {cpan ? (
                  <DialogDescription className="font-mono text-xs">
                    {cpan}
                  </DialogDescription>
                ) : null}
              </DialogHeader>
              <div className="rounded-lg border bg-white p-3 shadow-xs">
                <img
                  alt={copy.scan}
                  className="aspect-square size-64 max-w-full rounded-sm"
                  height={256}
                  src={qrSrc}
                  width={256}
                />
              </div>
              <div className="text-center">
                <p className="font-medium font-mono text-sm">
                  {cpan ?? (mode === "tap" ? "QRIS TAP" : "QRIS CPM")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {cardholder ?? (mode === "tap" ? "NFC / CPM" : "CPV01")}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  disabled={savingPng}
                  onClick={async () => {
                    setSavingPng(true);
                    try {
                      download(
                        await renderQrisPng(qrPayload),
                        `qris-${mode}.png`
                      );
                    } finally {
                      setSavingPng(false);
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  {copy.png}
                </Button>
                <Button
                  onClick={() => download(qrSrc, `qris-${mode}.svg`)}
                  size="sm"
                  variant="outline"
                >
                  {copy.svg}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
      <dl className="grid flex-1 grid-cols-2 gap-3 text-sm">
        {[
          [copy.cardholder, cardholder],
          [copy.cpan, cpan],
          [copy.appLabel, appLabel],
          [copy.format, format ?? (mode === "tap" ? "TAP" : "CPM")],
        ].map(([label, value]) => (
          <div className="group/item min-w-0" key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 flex items-center justify-between gap-1 break-all font-medium">
              <span className="min-w-0">{value ?? "—"}</span>
              {value ? (
                <CopyButton
                  className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100"
                  label={label}
                  value={value}
                />
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldTree({
  nodes,
  mode,
}: {
  readonly nodes: readonly TlvNode[];
  readonly mode: "cpm" | "tap";
}) {
  const copy =
    mode === "tap"
      ? messages.developerTools.qrisTap
      : messages.developerTools.qrisCpm;
  return nodes.map((node, index) => (
    <li
      className="relative min-w-0 border-t py-3 pl-4"
      key={`${node.tag}-${index}`}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={formatMessage(copy.infoLabel, { tag: node.tag })}
            className="absolute top-3 right-0"
            size="icon-sm"
            variant="ghost"
          >
            <Info />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="max-w-[calc(100vw-2rem)]">
          <p className="font-medium text-sm">
            {node.tag} · {node.name ?? copy.unknown}
          </p>
          <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
            {copy.tagInfo[node.tag as keyof typeof copy.tagInfo] ??
              copy.unknownInfo}
          </p>
        </PopoverContent>
      </Popover>
      <details open>
        <summary className="cursor-pointer rounded-sm pr-10 text-xs focus-visible:outline-2 focus-visible:outline-ring">
          <span className="ml-1 inline-grid min-h-8 w-[calc(100%-1.5rem)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 align-middle">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium font-mono text-primary">
                {node.tag}
              </span>
              <span className="min-w-0 break-words">
                {node.name ?? copy.unknown}
              </span>
            </span>
            <span className="whitespace-nowrap text-right text-muted-foreground tabular-nums">
              {node.length} {copy.length}
            </span>
          </span>
        </summary>
        {node.children ? (
          <ul className="mt-3 border-b border-l">
            <FieldTree mode={mode} nodes={node.children} />
          </ul>
        ) : (
          <dl className="mt-2 space-y-1 break-all font-mono text-xs">
            {[
              ["BCD", node.value_bcd],
              ["ASCII", node.value_ascii],
              ["Hex", node.value_hex],
              ["Base64", node.value_b64],
            ].map(([label, value]) =>
              value === undefined ? null : (
                <div
                  className="group/item flex items-center justify-between gap-2 rounded px-1.5 py-0.5 hover:bg-muted/30"
                  key={label}
                >
                  <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] items-center gap-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="select-text">{value}</dd>
                  </div>
                  <CopyButton
                    className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100"
                    label={`${node.name ?? node.tag} (${label})`}
                    value={value}
                  />
                </div>
              )
            )}
          </dl>
        )}
      </details>
    </li>
  ));
}

export function CpmParser({ mode = "cpm" }: { readonly mode?: "cpm" | "tap" }) {
  useI18n();
  const copy =
    mode === "tap"
      ? messages.developerTools.qrisTap
      : messages.developerTools.qrisCpm;
  const sample = mode === "tap" ? TAP_SAMPLE : CPM_SAMPLE;
  const sampleHex = mode === "tap" ? TAP_SAMPLE_HEX : CPM_SAMPLE_HEX;
  const [source, setSource] = useState(sample);
  const [encoding, setEncoding] = useState<CpmEncoding>("auto");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageRevision, setImageRevision] = useState(0);

  function changeSource(value: string) {
    setSource(value);
    setImageBusy(false);
    setImageRevision((revision) => revision + 1);
  }

  function handleDecode(decodedPayload: string) {
    setSource(decodedPayload);
    setEncoding("auto");
    setImageBusy(false);
  }

  const parsed = useMemo(() => {
    if (!source.trim()) {
      return null;
    }
    try {
      return {
        result:
          mode === "tap"
            ? parseTap(source, encoding)
            : parseCpm(source, encoding),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [source, encoding, mode]);
  const result = parsed?.result;

  const qr = useMemo(() => {
    if (!result?.base64) {
      return null;
    }
    try {
      return renderQrisQr(result.base64);
    } catch {
      return null;
    }
  }, [result?.base64]);

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:shrink-0"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <Button
          onClick={() => changeSource(encoding === "hex" ? sampleHex : sample)}
          size="sm"
          variant="tool-action"
        >
          {copy.sample}
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => changeSource("")}
      title={copy.title}
    >
      <div className="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="flex min-h-0 min-w-0 flex-col gap-3 rounded-xl border border-border/70 p-4">
          <QrImageInput
            key={imageRevision}
            onDecode={handleDecode}
            onProcessing={setImageBusy}
            onRemove={() => changeSource("")}
          />
          <span className="font-medium text-sm" id="cpm-encoding-label">
            {copy.encoding}
          </span>
          <ToggleGroup
            aria-labelledby="cpm-encoding-label"
            className="w-full"
            onValueChange={(values) => {
              const value = values[0];
              if (value === "auto" || value === "base64" || value === "hex") {
                setEncoding(value);
              }
            }}
            spacing={1}
            value={[encoding]}
            variant="subtle"
          >
            <ToggleGroupItem className="flex-1" value="auto">
              {copy.auto}
            </ToggleGroupItem>
            <ToggleGroupItem className="flex-1" value="base64">
              Base64
            </ToggleGroupItem>
            <ToggleGroupItem className="flex-1" value="hex">
              Hex
            </ToggleGroupItem>
          </ToggleGroup>
          <Label htmlFor="cpm-payload">{copy.input}</Label>
          <ScrollArea className="h-64 min-h-0 lg:flex-1" variant="fit">
            <Textarea
              aria-busy={imageBusy}
              aria-describedby={parsed?.error ? "cpm-error" : undefined}
              aria-invalid={Boolean(parsed?.error)}
              className="field-sizing-content min-h-64 resize-none overflow-hidden"
              disabled={imageBusy}
              id="cpm-payload"
              onChange={(event) => changeSource(event.target.value)}
              value={source}
              variant="mono-muted"
            />
          </ScrollArea>
          {parsed?.error ? (
            <p
              className="break-all text-destructive text-sm"
              id="cpm-error"
              role="alert"
            >
              {copy.invalid} {parsed.error}
            </p>
          ) : null}
        </section>
        <section
          aria-label={copy.fields}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/70"
        >
          <h2 className="shrink-0 border-b bg-muted/10 px-4 py-3 font-semibold text-sm">
            {copy.fields}
          </h2>
          {result ? (
            <CpmSummary
              mode={mode}
              qrPayload={result.base64}
              qrSrc={qr?.src}
              result={result}
            />
          ) : null}
          <ScrollArea
            className="h-96 min-h-0 lg:h-auto lg:flex-1"
            variant="fit"
          >
            {mode === "tap" ? (
              <TapInspectionOutput encoding={encoding} source={source} />
            ) : null}
            {result ? (
              <>
                <div aria-live="polite" className="space-y-2 px-4 py-3 text-xs">
                  <p className="text-muted-foreground">
                    {result.byteLength} {copy.length}
                  </p>
                  {result.profileMatches ? null : (
                    <p className="text-destructive">{copy.profile}</p>
                  )}
                  <details>
                    <summary className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                      {copy.raw}
                    </summary>
                    <div className="mt-2 flex items-start justify-between gap-2 rounded-md bg-muted/20 p-2.5">
                      <p className="min-w-0 select-text break-all font-mono">
                        {result.hex}
                      </p>
                      <CopyButton label={copy.raw} value={result.hex} />
                    </div>
                  </details>
                </div>
                <ul className="pr-4 pb-4">
                  <FieldTree mode={mode} nodes={result.tlv} />
                </ul>
              </>
            ) : (
              <p className="px-4 py-16 text-center text-muted-foreground text-sm">
                {copy.empty}
              </p>
            )}
          </ScrollArea>
        </section>
      </div>
    </DeveloperToolLayout>
  );
}
