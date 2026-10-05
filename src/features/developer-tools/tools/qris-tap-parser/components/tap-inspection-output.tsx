import { type ReactNode, useMemo, useState } from "react";
import { Clipboard } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  qrisTlvColor,
  TlvHexSegments,
} from "@/features/developer-tools/components/qris-tlv-colors";
import type {
  CpmEncoding,
  TlvNode,
} from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";
import { inspectTap } from "@/features/developer-tools/tools/qris-tap-parser/parse-tap";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";

function EvidenceOutput({
  title,
  value,
  children,
}: {
  readonly children?: ReactNode;
  readonly title: string;
  readonly value: string | null;
}) {
  const copy = messages.developerTools.qrisTap;
  const [status, setStatus] = useState<string | null>(null);
  return (
    <details className="border-t px-4 py-3">
      <summary className="cursor-pointer rounded-sm font-medium text-xs focus-visible:outline-2 focus-visible:outline-ring">
        {title}
      </summary>
      {value === null ? (
        <p className="mt-3 text-muted-foreground text-xs">{copy.unavailable}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-end gap-2">
            <span aria-live="polite" className="text-muted-foreground text-xs">
              {status}
            </span>
            <Button
              aria-label={`${copy.copyOutput}: ${title}`}
              onClick={async () => {
                try {
                  setStatus(
                    (await copyToClipboard(value))
                      ? copy.copiedOutput
                      : copy.copyFailed
                  );
                } catch {
                  setStatus(copy.copyFailed);
                }
              }}
              size="icon-xs"
              title={copy.copyOutput}
              variant="ghost"
            >
              <Clipboard />
            </Button>
          </div>
          <pre className="whitespace-pre-wrap break-all rounded-md bg-muted/20 p-3 font-mono text-xs leading-relaxed">
            {children ?? value}
          </pre>
        </div>
      )}
    </details>
  );
}

export function TapInspectionOutput({
  source,
  encoding,
  nodes,
}: {
  readonly nodes?: readonly TlvNode[];
  readonly source: string;
  readonly encoding: CpmEncoding;
}) {
  const copy = messages.developerTools.qrisTap;
  const result = useMemo(
    () => (source.trim() ? inspectTap(source, encoding) : null),
    [source, encoding]
  );
  if (!result) {
    return null;
  }
  return (
    <div>
      <div className="flex flex-col gap-2 px-4 py-3 text-xs">
        <h3 className="font-semibold">{copy.inspection}</h3>
        <p className="text-muted-foreground">{copy.inputOrigin}</p>
        <p
          className={
            result.outcome === "SUCCESS"
              ? "font-semibold text-success"
              : "font-medium text-destructive"
          }
        >
          {result.outcome === "SUCCESS" ? copy.success : copy.failure}
        </p>
        {result.failureStage ? (
          <p className="break-all text-destructive">
            {copy.failureStage}: {result.failureStage}. {result.failure}
          </p>
        ) : null}
      </div>
      <EvidenceOutput
        key={`base64-${result.base64}`}
        title={copy.base64Source}
        value={result.base64}
      />
      <EvidenceOutput
        key={`hex-${result.hex}`}
        title={copy.decodedHex}
        value={result.hex}
      >
        {result.hex && nodes ? (
          <TlvHexSegments hex={result.hex} nodes={nodes} />
        ) : undefined}
      </EvidenceOutput>
      <EvidenceOutput
        key={`tree-${result.tree}`}
        title={copy.textTree}
        value={result.tree}
      >
        {result.tree?.split("\n").map((line, index) => (
          <span
            className={qrisTlvColor(line.trimStart().split(" ")[0])}
            key={`${index}-${line}`}
          >
            {line}
            {"\n"}
          </span>
        ))}
      </EvidenceOutput>
      <EvidenceOutput
        key={`log-${result.log}`}
        title={copy.executionLog}
        value={result.log}
      />
      <details className="border-t px-4 py-3">
        <summary className="cursor-pointer rounded-sm font-medium text-xs focus-visible:outline-2 focus-visible:outline-ring">
          {copy.apdu}
        </summary>
        <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
          {copy.apduUnavailable}
        </p>
      </details>
    </div>
  );
}
