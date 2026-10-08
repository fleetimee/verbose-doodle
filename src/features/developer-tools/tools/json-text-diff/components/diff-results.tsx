import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  DiffResult,
  JsonChange,
  TextLine,
} from "@/features/developer-tools/tools/json-text-diff/compare-documents";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function getDiffSummary(result: DiffResult) {
  if (result.mode === "text") {
    const added = result.lines.filter((line) => line.kind === "added").length;
    const removed = result.lines.filter(
      (line) => line.kind === "removed"
    ).length;
    return added + removed === 0
      ? messages.jsonTextDiff.identical
      : formatMessage(messages.jsonTextDiff.textSummary, { added, removed });
  }
  if (result.changes.length === 0) {
    return messages.jsonTextDiff.identical;
  }
  const counts = { added: 0, removed: 0, changed: 0, reordered: 0 };
  for (const change of result.changes) {
    counts[change.kind]++;
  }
  return formatMessage(messages.jsonTextDiff.summary, counts);
}

function JsonChangeRow({ change }: { readonly change: JsonChange }) {
  return (
    <li className="border-border/60 border-b last:border-b-0">
      <div className="flex flex-wrap items-center gap-2 bg-muted/20 px-3 py-1.5">
        <span className="font-medium text-xs">
          {messages.jsonTextDiff[change.kind]}
        </span>
        <code className="break-all font-mono text-xs">
          {change.path || messages.jsonTextDiff.root}
        </code>
      </div>
      {change.kind === "reordered" ? (
        <p className="px-4 pt-2 text-muted-foreground text-xs">
          {messages.jsonTextDiff.orderNote}
        </p>
      ) : null}
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            "min-w-0 px-3 py-2",
            change.kind !== "added" && "bg-destructive/5"
          )}
        >
          <p className="mb-1 text-muted-foreground text-xs">
            {messages.jsonTextDiff.before}
          </p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-5">
            {change.kind === "added"
              ? messages.jsonTextDiff.missing
              : JSON.stringify(change.before, null, 2)}
          </pre>
        </div>
        <div
          className={cn(
            "min-w-0 border-border/60 border-t px-3 py-2 md:border-t-0 md:border-l",
            change.kind !== "removed" && "bg-success/5"
          )}
        >
          <p className="mb-1 text-muted-foreground text-xs">
            {messages.jsonTextDiff.after}
          </p>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-5">
            {change.kind === "removed"
              ? messages.jsonTextDiff.missing
              : JSON.stringify(change.after, null, 2)}
          </pre>
        </div>
      </div>
    </li>
  );
}

function TextLineCell({
  line,
  side,
}: {
  readonly line: TextLine;
  readonly side: "before" | "after";
}) {
  const number = side === "before" ? line.beforeLine : line.afterLine;
  const visible = number !== undefined;
  const isChanged = visible && line.kind !== "equal";
  const marker = side === "before" ? "−" : "+";
  return (
    <td
      className={cn(
        "w-1/2 align-top",
        side === "after" && "border-border/60 border-l",
        isChanged && (side === "before" ? "bg-destructive/10" : "bg-success/10")
      )}
    >
      {visible ? (
        <div className="flex gap-3 px-3 py-1">
          <span
            aria-hidden="true"
            className="w-8 shrink-0 select-none text-right text-muted-foreground"
          >
            {number}
          </span>
          <span className="sr-only">{messages.jsonTextDiff[line.kind]}</span>
          <span aria-hidden="true" className="w-3 shrink-0">
            {isChanged ? marker : " "}
          </span>
          <pre className="min-w-0 whitespace-pre-wrap break-all font-mono">
            {line.value || (
              <span className="text-muted-foreground italic">
                {messages.jsonTextDiff.blankLine}
              </span>
            )}
          </pre>
        </div>
      ) : null}
    </td>
  );
}

const CHANGES_PER_PAGE = 100;

function JsonChanges({ changes }: { readonly changes: readonly JsonChange[] }) {
  const [page, setPage] = useState(0);
  if (changes.length === 0) {
    return null;
  }
  const start = page * CHANGES_PER_PAGE;
  const end = Math.min(start + CHANGES_PER_PAGE, changes.length);
  return (
    <>
      <ul className="max-h-80 overflow-auto lg:max-h-none lg:min-h-0 lg:flex-1">
        {changes.slice(start, end).map((change) => (
          <JsonChangeRow
            change={change}
            key={`${change.kind}:${change.path}`}
          />
        ))}
      </ul>
      {changes.length > CHANGES_PER_PAGE ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-border/60 border-t px-3 py-2">
          <p aria-live="polite" className="text-muted-foreground text-xs">
            {formatMessage(messages.jsonTextDiff.pageSummary, {
              start: start + 1,
              end,
              total: changes.length,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              size="sm"
              type="button"
              variant="outline-muted"
            >
              {messages.jsonTextDiff.previous}
            </Button>
            <Button
              disabled={end === changes.length}
              onClick={() => setPage(page + 1)}
              size="sm"
              type="button"
              variant="outline-muted"
            >
              {messages.jsonTextDiff.next}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DiffResults({ result }: { readonly result: DiffResult }) {
  if (result.mode === "json") {
    return <JsonChanges changes={result.changes} />;
  }
  return (
    <div className="max-h-80 overflow-auto lg:max-h-none lg:min-h-0 lg:flex-1">
      <table className="w-full table-fixed border-collapse font-mono text-xs leading-5">
        <caption className="sr-only">{messages.jsonTextDiff.results}</caption>
        <thead className="sticky top-0 bg-background text-left">
          <tr>
            <th className="border-border/60 border-b px-4 py-2 font-medium">
              {messages.jsonTextDiff.before}
            </th>
            <th className="border-border/60 border-b border-l px-4 py-2 font-medium">
              {messages.jsonTextDiff.after}
            </th>
          </tr>
        </thead>
        <tbody>
          {result.lines.map((line) => (
            <tr
              key={`${line.kind}:${line.beforeLine ?? ""}:${line.afterLine ?? ""}`}
            >
              <TextLineCell line={line} side="before" />
              <TextLineCell line={line} side="after" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
