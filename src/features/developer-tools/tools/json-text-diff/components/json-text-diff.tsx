import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import {
  compareDocuments,
  DiffError,
  type DiffMode,
  type DiffResult,
  serializeDiff,
} from "@/features/developer-tools/tools/json-text-diff/compare-documents";
import {
  DiffResults,
  getDiffSummary,
} from "@/features/developer-tools/tools/json-text-diff/components/diff-results";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

const JSON_BEFORE =
  '{\n  "reference": "BILL-001",\n  "amount": 150000,\n  "status": "pending",\n  "fee": 2500\n}';
const JSON_AFTER =
  '{\n  "status": "paid",\n  "reference": "BILL-001",\n  "amount": 150000,\n  "paidAt": "2026-10-08T03:00:00Z"\n}';
const TEXT_BEFORE =
  "reference=BILL-001\namount=150000\nstatus=pending\nfee=2500";
const TEXT_AFTER =
  "reference=BILL-001\namount=150000\nstatus=paid\npaidAt=2026-10-08T03:00:00Z";

function errorMessage(error: Error) {
  if (!(error instanceof DiffError)) {
    return messages.jsonTextDiff.failed;
  }
  const side =
    error.side === "before"
      ? messages.jsonTextDiff.before
      : messages.jsonTextDiff.after;
  const template = {
    size: messages.jsonTextDiff.sizeError,
    json: messages.jsonTextDiff.jsonError,
    depth: messages.jsonTextDiff.depthError,
    lines: messages.jsonTextDiff.linesError,
    complexity: messages.jsonTextDiff.complexityError,
    number: messages.jsonTextDiff.numberError,
  }[error.code];
  return formatMessage(template, { side });
}

export function JsonTextDiff() {
  useI18n();
  const [mode, setMode] = useState<DiffMode>("json");
  const [before, setBefore] = useState(JSON_BEFORE);
  const [after, setAfter] = useState(JSON_AFTER);
  const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
  const [result, setResult] = useState<DiffResult | null>(() =>
    compareDocuments(JSON_BEFORE, JSON_AFTER, "json", true)
  );
  const [error, setError] = useState<Error | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );

  const resetResult = () => {
    setResult(null);
    setError(null);
    setCopyState("idle");
  };

  const compare = useCallback(() => {
    setCopyState("idle");
    try {
      setResult(compareDocuments(before, after, mode, ignoreKeyOrder));
      setError(null);
    } catch (comparisonError) {
      setResult(null);
      setError(
        comparisonError instanceof Error
          ? comparisonError
          : new Error("Comparison failed")
      );
    }
  }, [before, after, mode, ignoreKeyOrder]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        compare();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [compare]);

  const loadExample = () => {
    const exampleBefore = mode === "json" ? JSON_BEFORE : TEXT_BEFORE;
    const exampleAfter = mode === "json" ? JSON_AFTER : TEXT_AFTER;
    setBefore(exampleBefore);
    setAfter(exampleAfter);
    setResult(
      compareDocuments(exampleBefore, exampleAfter, mode, ignoreKeyOrder)
    );
    setError(null);
    setCopyState("idle");
  };

  const copy = async () => {
    if (!result) {
      return;
    }
    try {
      setCopyState(
        (await copyToClipboard(serializeDiff(result))) ? "copied" : "error"
      );
    } catch {
      setCopyState("error");
    }
  };

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-3 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={messages.jsonTextDiff.clear}
      description={messages.jsonTextDiff.description}
      mainClassName="flex min-h-0 flex-1 flex-col gap-2"
      onClear={() => {
        setBefore("");
        setAfter("");
        resetResult();
      }}
      onReset={loadExample}
      resetLabel={messages.jsonTextDiff.resetExample}
      title={messages.jsonTextDiff.title}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-lg bg-muted/15 px-3 py-2">
        <div className="flex items-center gap-3">
          <Label htmlFor="diff-mode">{messages.jsonTextDiff.mode}</Label>
          <Select
            onValueChange={(value) => {
              if (value === "json" || value === "text") {
                setMode(value);
                resetResult();
              }
            }}
            value={mode}
          >
            <SelectTrigger
              className="w-36"
              id="diff-mode"
              size="sm"
              variant="surface"
            >
              <SelectValue>
                {mode === "json"
                  ? messages.jsonTextDiff.json
                  : messages.jsonTextDiff.text}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">{messages.jsonTextDiff.json}</SelectItem>
              <SelectItem value="text">{messages.jsonTextDiff.text}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mode === "json" ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={ignoreKeyOrder}
              id="diff-key-order"
              onCheckedChange={(checked) => {
                setIgnoreKeyOrder(checked);
                resetResult();
              }}
            />
            <Label htmlFor="diff-key-order">
              {messages.jsonTextDiff.ignoreKeyOrder}
            </Label>
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => {
              setBefore(after);
              setAfter(before);
              resetResult();
            }}
            size="sm"
            type="button"
            variant="outline-muted"
          >
            {messages.jsonTextDiff.swap}
          </Button>
          <Button
            onClick={compare}
            size="sm"
            title="Ctrl / ⌘ + Enter"
            type="button"
          >
            {messages.jsonTextDiff.compare}
          </Button>
        </div>
      </div>
      <p className="shrink-0 text-muted-foreground text-xs leading-5">
        {mode === "json"
          ? messages.jsonTextDiff.jsonNote
          : messages.jsonTextDiff.textNote}
      </p>
      <div className="grid min-w-0 shrink-0 overflow-hidden rounded-xl border border-border/70 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        <DocumentEditor
          byteCountMessage={messages.jsonTextDiff.byteCount}
          className="h-56 border-t-0 lg:h-full"
          compact
          description={messages.jsonTextDiff.beforeDescription}
          format={mode}
          height="100%"
          label={messages.jsonTextDiff.before}
          lineCountMessage={messages.jsonTextDiff.lineCount}
          onChange={(value) => {
            setBefore(value);
            resetResult();
          }}
          value={before}
        />
        <DocumentEditor
          byteCountMessage={messages.jsonTextDiff.byteCount}
          className="h-56 lg:h-full lg:border-t-0 lg:border-l"
          compact
          description={messages.jsonTextDiff.afterDescription}
          format={mode}
          height="100%"
          label={messages.jsonTextDiff.after}
          lineCountMessage={messages.jsonTextDiff.lineCount}
          onChange={(value) => {
            setAfter(value);
            resetResult();
          }}
          value={after}
        />
      </div>
      {error ? (
        <div
          className="max-h-24 shrink-0 overflow-auto rounded-lg border border-destructive/30 px-3 py-2 text-sm"
          role="alert"
        >
          <p className="font-medium text-destructive">{errorMessage(error)}</p>
          {error instanceof DiffError && error.code === "json" ? (
            <p className="mt-2 break-all font-mono text-xs">{error.message}</p>
          ) : null}
        </div>
      ) : null}
      <section
        aria-labelledby="diff-results-title"
        className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 lg:flex-1"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-border/60 border-b px-3 py-2">
          <div>
            <h2 className="font-semibold text-sm" id="diff-results-title">
              {messages.jsonTextDiff.results}
            </h2>
            <p
              aria-live="polite"
              className="mt-1 text-muted-foreground text-xs"
            >
              {result ? getDiffSummary(result) : messages.jsonTextDiff.empty}
            </p>
          </div>
          <Button
            disabled={!result}
            onClick={copy}
            size="sm"
            type="button"
            variant="outline-muted"
          >
            {copyState === "copied"
              ? messages.jsonTextDiff.copied
              : messages.jsonTextDiff.copy}
          </Button>
        </header>
        {result ? <DiffResults result={result} /> : null}
        {copyState === "error" ? (
          <p
            className="shrink-0 px-3 py-2 text-destructive text-sm"
            role="alert"
          >
            {messages.jsonTextDiff.copyError}
          </p>
        ) : null}
      </section>
    </DeveloperToolLayout>
  );
}
