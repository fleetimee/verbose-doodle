import { useState } from "react";
import { toast } from "sonner";
import type { JsonSchemaDiagnostic } from "@/features/json-schema-validator/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

type DiagnosticListProps = {
  readonly diagnostics: readonly JsonSchemaDiagnostic[];
  readonly errorCount: number;
  readonly truncated: boolean;
};

function diagnosticPath(diagnostic: JsonSchemaDiagnostic): string {
  if (diagnostic.instancePath !== undefined) {
    return diagnostic.instancePath || "/";
  }
  if (diagnostic.schemaPath) {
    return diagnostic.schemaPath;
  }
  if (diagnostic.line && diagnostic.column) {
    return formatMessage(messages.jsonSchemaValidator.diagnosticLineColumn, {
      line: diagnostic.line,
      column: diagnostic.column,
    });
  }
  return diagnostic.source === "SCHEMA"
    ? messages.jsonSchemaValidator.diagnosticSchemaFallback
    : messages.jsonSchemaValidator.diagnosticInstanceFallback;
}

export function DiagnosticList({
  diagnostics,
  errorCount,
  truncated,
}: DiagnosticListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyDiagnostic = async (
    diagnostic: JsonSchemaDiagnostic,
    index: number
  ) => {
    const text = `${diagnosticPath(diagnostic)}: ${diagnostic.message}`;
    try {
      await copyToClipboard(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error(messages.jsonSchemaValidator.diagnosticCopyError);
    }
  };

  return (
    <div className="border-t">
      {diagnostics.map((diagnostic, index) => (
        <div
          className="group grid grid-cols-[34px_minmax(0,1fr)_auto] gap-3 border-b py-4 transition-colors hover:bg-muted/20"
          key={`${diagnostic.source}-${diagnosticPath(diagnostic)}-${index}`}
        >
          <span className="mt-1 font-mono text-[10px] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all font-mono text-[11px] text-foreground">
                {diagnosticPath(diagnostic)}
              </code>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                {diagnostic.source}
                {diagnostic.keyword ? ` · ${diagnostic.keyword}` : ""}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-5">{diagnostic.message}</p>
          </div>
          <button
            aria-label={formatMessage(
              messages.jsonSchemaValidator.diagnosticCopyAriaLabel,
              { number: index + 1 }
            )}
            className="self-start font-mono text-[10px] text-muted-foreground uppercase tracking-wider underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={() => copyDiagnostic(diagnostic, index)}
            type="button"
          >
            {copiedIndex === index
              ? messages.jsonSchemaValidator.diagnosticCopied
              : messages.jsonSchemaValidator.diagnosticCopy}
          </button>
        </div>
      ))}
      {truncated ? (
        <p className="border-b py-3 text-muted-foreground text-xs">
          {formatMessage(messages.jsonSchemaValidator.diagnosticsTruncated, {
            count: errorCount,
          })}
        </p>
      ) : null}
    </div>
  );
}
