import { useMemo, useState } from "react";
import { Check, Info } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
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
import { TapInspectionOutput } from "@/features/developer-tools/tools/qris-tap-parser/components/tap-inspection-output";
import {
  parseTap,
  TAP_SAMPLE,
  TAP_SAMPLE_HEX,
} from "@/features/developer-tools/tools/qris-tap-parser/parse-tap";
import { formatMessage, messages } from "@/lib/i18n";

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
                  className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2"
                  key={label}
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="select-text">{value}</dd>
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
  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:shrink-0"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <Button
          onClick={() => setSource(encoding === "hex" ? sampleHex : sample)}
          size="sm"
          variant="tool-action"
        >
          {copy.sample}
        </Button>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => setSource("")}
      title={copy.title}
    >
      <div className="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="flex min-h-0 min-w-0 flex-col gap-3 rounded-xl border border-border/70 p-4">
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
            spacing={2}
            value={[encoding]}
            variant="outline"
          >
            <ToggleGroupItem className="min-h-12 flex-1" value="auto">
              <Check
                aria-hidden="true"
                className={encoding === "auto" ? "visible" : "invisible"}
              />
              {copy.auto}
            </ToggleGroupItem>
            <ToggleGroupItem className="min-h-12 flex-1" value="base64">
              <Check
                aria-hidden="true"
                className={encoding === "base64" ? "visible" : "invisible"}
              />
              Base64
            </ToggleGroupItem>
            <ToggleGroupItem className="min-h-12 flex-1" value="hex">
              <Check
                aria-hidden="true"
                className={encoding === "hex" ? "visible" : "invisible"}
              />
              Hex
            </ToggleGroupItem>
          </ToggleGroup>
          <Label htmlFor="cpm-payload">{copy.input}</Label>
          <ScrollArea className="h-64 min-h-0 lg:flex-1" variant="fit">
            <Textarea
              aria-describedby={parsed?.error ? "cpm-error" : undefined}
              aria-invalid={Boolean(parsed?.error)}
              className="field-sizing-content min-h-64 resize-none overflow-hidden"
              id="cpm-payload"
              onChange={(event) => setSource(event.target.value)}
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
                    <p className="mt-2 break-all font-mono">{result.hex}</p>
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
