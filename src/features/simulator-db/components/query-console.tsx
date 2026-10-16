import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Eraser, RefreshCw } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  executeSqlQuery,
  executeSqlStatement,
} from "@/features/simulator-db/api";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
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

function isBoolean(val: SqlCellValue): val is boolean {
  return typeof val === "boolean";
}

function isNumber(val: SqlCellValue): val is number {
  return typeof val === "number";
}

function formatCellValue(val: SqlCellValue): string {
  if (val === null || val === undefined) {
    return "NULL";
  }
  if (isBoolean(val)) {
    return val ? "true" : "false";
  }
  if (isNumber(val)) {
    return String(val);
  }
  return val;
}

export function QueryConsole({ selectedTable, tables }: QueryConsoleProps) {
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update query preset when selected table changes
  useEffect(() => {
    if (selectedTable) {
      setSql(`SELECT * FROM "${selectedTable}" LIMIT 50;`);
    }
  }, [selectedTable]);

  const handleRun = async () => {
    const trimmed = sql.trim();
    if (!trimmed) {
      return;
    }

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
      setIsRunning(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun().catch(() => undefined);
    }
  };

  const resultColumns =
    results && results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="flex h-full flex-col">
      {/* Console Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-1.5 text-xs">
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
            <span>Execute</span>
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
            Clear
          </Button>

          {/* Quick Query Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {selectedTable && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      setSql(`SELECT * FROM "${selectedTable}" LIMIT 100;`)
                    }
                  >
                    SELECT * FROM {selectedTable}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSql(
                        `SELECT COUNT(*) AS total FROM "${selectedTable}";`
                      )
                    }
                  >
                    COUNT records in {selectedTable}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSql(`PRAGMA table_info("${selectedTable}");`)
                    }
                  >
                    PRAGMA table_info({selectedTable})
                  </DropdownMenuItem>
                </>
              )}
              {tables.length > 0 && (
                <DropdownMenuItem
                  onClick={() =>
                    setSql(
                      "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;"
                    )
                  }
                >
                  List All Tables ({tables.length}) & Schema
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* SQL Editor Area */}
      <div className="relative border-b bg-background p-2">
        <Textarea
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter SQL statement (e.g. SELECT * FROM table_name LIMIT 50)... Press ⌘+Enter to execute"
          ref={textareaRef}
          rows={5}
          size="xs"
          value={sql}
          variant="ghost-mono"
        />
      </div>

      {/* Results / Error Panel */}
      <div className="flex-1 overflow-auto bg-background">
        {error && (
          <div className="m-3 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
            <HugeiconsIcon
              className="mt-0.5 size-4 shrink-0"
              icon={AlertCircleIcon}
            />
            <div className="space-y-1">
              <p className="font-semibold">Query execution error</p>
              <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                {error}
              </pre>
            </div>
          </div>
        )}

        {affectedRows !== null && !error && (
          <div className="m-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-success text-xs">
            <HugeiconsIcon
              className="size-4 shrink-0 text-success"
              icon={CheckmarkCircle02Icon}
            />
            <span>
              Statement executed successfully: {affectedRows} rows affected.
            </span>
          </div>
        )}

        {results && results.length > 0 && (
          <Table>
            <TableHeader variant="sticky">
              <TableRow>
                <TableHead>#</TableHead>
                {resultColumns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell size="compact" variant="muted">
                    <span className="tabular-nums">{idx + 1}</span>
                  </TableCell>
                  {resultColumns.map((col) => {
                    const val = row[col];
                    const isNull = val === null || val === undefined;
                    const strVal = formatCellValue(val);

                    return (
                      <TableCell
                        key={col}
                        onClick={() =>
                          setInspectCell({ columnName: col, value: val })
                        }
                        size="compact"
                        variant="mono"
                      >
                        <div
                          className="max-w-[260px] cursor-pointer truncate"
                          title="Click to view full detail"
                        >
                          {isNull ? (
                            <span className="text-muted-foreground/60 italic">
                              NULL
                            </span>
                          ) : (
                            <span className="truncate">{strVal}</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {results && results.length === 0 && !error && (
          <div className="py-12 text-center text-muted-foreground text-xs">
            Query returned 0 rows.
          </div>
        )}

        {!results && affectedRows === null && !error && !isRunning && (
          <div className="flex h-full items-center justify-center py-16 text-center text-muted-foreground text-xs">
            Write an SQL statement above and press Execute (⌘+Enter).
          </div>
        )}
      </div>

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
