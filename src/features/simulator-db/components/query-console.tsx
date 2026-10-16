import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Code2, Eraser, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import {
  executeSqlQuery,
  executeSqlStatement,
} from "@/features/simulator-db/api";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
import { DatabaseGridSkeleton } from "@/features/simulator-db/components/database-load-state";
import { QueryResultGrid } from "@/features/simulator-db/components/query-result-grid";
import { QueryTemplateMenu } from "@/features/simulator-db/components/query-template-menu";
import { SqlQueryEditor } from "@/features/simulator-db/components/sql-query-editor";
import {
  extractErrorMessage,
  type SqlCellValue,
  type SqlRow,
  type TableMetadata,
} from "@/features/simulator-db/types";

type QueryConsoleProps = {
  readonly selectedTable: string | null;
  readonly tables: readonly TableMetadata[];
};

export function QueryConsole({ selectedTable, tables }: QueryConsoleProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const [wrapText, setWrapText] = useState(false);
  const [sql, setSql] = useState<string>(
    selectedTable ? `SELECT * FROM "${selectedTable}" LIMIT 50;` : "SELECT 1;"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SqlRow[] | null>(null);
  const [affectedRows, setAffectedRows] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [inspectCell, setInspectCell] = useState<{
    columnName: string;
    value: SqlCellValue;
  } | null>(null);

  const runningRef = useRef(false);

  // Update query preset when selected table changes
  useEffect(() => {
    if (selectedTable) {
      setSql(`SELECT * FROM "${selectedTable}" LIMIT 50;`);
    }
  }, [selectedTable]);

  const handleRun = async () => {
    const trimmed = sql.trim();
    if (!trimmed || runningRef.current) {
      return;
    }

    runningRef.current = true;
    setIsRunning(true);
    setError(null);
    setResults(null);
    setAffectedRows(null);
    const startTime = performance.now();

    try {
      const isSelect =
        trimmed.toLowerCase().startsWith("select") ||
        trimmed.toLowerCase().startsWith("pragma") ||
        trimmed.toLowerCase().startsWith("explain");

      if (isSelect) {
        const rows = await executeSqlQuery(trimmed, 500);
        setResults(rows);
      } else {
        const res = await executeSqlStatement(trimmed);
        setAffectedRows(res.affectedRows);
      }
      setExecutionTime(Math.round(performance.now() - startTime));
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      setExecutionTime(Math.round(performance.now() - startTime));
    } finally {
      runningRef.current = false;
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Console Toolbar */}
      <div className="database-toolbar flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            disabled={isRunning || !sql.trim()}
            onClick={() => {
              handleRun().catch(() => undefined);
            }}
            size="xs"
          >
            {isRunning ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <HugeiconsIcon
                className="size-3.5 fill-current"
                icon={PlayIcon}
              />
            )}
            <span>{m.execute}</span>
            <kbd className="ml-1 rounded bg-primary-foreground/20 px-1 py-0.5 text-xs">
              ⌘↵
            </kbd>
          </Button>

          <Button
            onClick={() => {
              setSql("");
              setResults(null);
              setError(null);
            }}
            size="xs"
            variant="ghost-muted"
          >
            <Eraser className="size-3.5" />
            {m.clear}
          </Button>

          <QueryTemplateMenu
            disabled={isRunning}
            onSelect={setSql}
            selectedTable={selectedTable}
          />
        </div>

        {/* Execution Stats Banner */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {executionTime !== null && (
            <span className="tabular-nums">
              Time:{" "}
              <strong className="text-foreground">{executionTime} ms</strong>
            </span>
          )}
          {results !== null && (
            <span className="tabular-nums">
              Rows:{" "}
              <strong className="text-foreground">{results.length}</strong>
            </span>
          )}
          {affectedRows !== null && (
            <span className="tabular-nums">
              Affected:{" "}
              <strong className="text-foreground">{affectedRows} rows</strong>
            </span>
          )}
        </div>
      </div>

      <ResizablePanelGroup className="min-h-0 flex-1" direction="vertical">
        <ResizablePanel defaultSize="40%" minSize="100px">
          <div className="flex h-full min-h-0 flex-col p-3">
            <SqlQueryEditor
              onChange={setSql}
              onExecute={() => {
                handleRun().catch(() => undefined);
              }}
              selectedTable={selectedTable}
              tables={tables}
              value={sql}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label={m.resizeEditor} className="h-px w-full" />
        <ResizablePanel minSize="100px">
          <div className="flex h-full min-h-0 flex-col" data-wrap={wrapText}>
            <div className="database-toolbar flex shrink-0 items-center justify-between gap-2 border-b px-3 py-1">
              <span className="text-muted-foreground text-xs">{m.results}</span>
              <Toggle
                aria-label={m.wrapText}
                onPressedChange={setWrapText}
                pressed={wrapText}
                size="sm"
              >
                {m.wrapText}
              </Toggle>
            </div>
            <div className="database-grid relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
              <ScrollArea
                className="h-full min-h-0 w-full min-w-0"
                contentClassName="min-h-full"
                variant="fit"
              >
                {error && (
                  <Alert className="m-3 w-auto" variant="destructive">
                    <HugeiconsIcon icon={AlertCircleIcon} />
                    <AlertTitle>{m.queryError}</AlertTitle>
                    <AlertDescription>
                      <pre className="whitespace-pre-wrap break-all">
                        {error}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}

                {affectedRows !== null && !error && (
                  <Alert className="m-3 w-auto">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                    <AlertTitle>{m.statementSuccess}</AlertTitle>
                    <AlertDescription>{affectedRows}</AlertDescription>
                  </Alert>
                )}

                {results && results.length > 0 && (
                  <QueryResultGrid
                    onInspect={setInspectCell}
                    results={results}
                  />
                )}

                {isRunning && <DatabaseGridSkeleton label={m.loadingData} />}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {!(isRunning || error) &&
                affectedRows === null &&
                (!results || results.length === 0) && (
                  <Empty className="absolute inset-0" size="compact">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Code2 />
                      </EmptyMedia>
                      <EmptyDescription>
                        {results ? m.queryEmpty : m.queryHint}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* Cell Inspect Dialog */}
      <CellDetailDialog
        columnName={inspectCell?.columnName ?? null}
        onOpenChange={(open) => !open && setInspectCell(null)}
        open={Boolean(inspectCell)}
        value={inspectCell?.value ?? null}
      />
    </div>
  );
}
