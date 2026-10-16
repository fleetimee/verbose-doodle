import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Eraser, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import {
  executeSqlQuery,
  executeSqlStatement,
} from "@/features/simulator-db/api";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
import { DatabaseCellMenu } from "@/features/simulator-db/components/database-cell-menu";
import {
  DatabaseColumnHeader,
  fitDatabaseColumn,
  useDatabaseColumns,
} from "@/features/simulator-db/components/database-column-header";
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update query preset when selected table changes
  useEffect(() => {
    if (selectedTable) {
      setSql(`SELECT * FROM "${selectedTable}" LIMIT 50;`);
    }
  }, [selectedTable]);

  const handleRun = async () => {
    const trimmed = sql.trim();
    if (!trimmed || isRunning) {
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

  const columnLayout = useDatabaseColumns(
    Object.fromEntries(
      resultColumns.map((name) => [
        name,
        Math.min(
          480,
          fitDatabaseColumn(
            name,
            (results ?? []).map((row) => row[name])
          )
        ),
      ])
    )
  );

  const tableStyle: CSSProperties & { "--database-table-width": string } = {
    "--database-table-width": `${48 + resultColumns.reduce((total, name) => total + columnLayout.width(name), 0)}px`,
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

          {/* Quick Query Templates */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                {m.templates}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
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
              </DropdownMenuGroup>
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

      <ResizablePanelGroup className="min-h-0 flex-1" direction="vertical">
        <ResizablePanel defaultSize="40%" minSize="100px">
          <div className="flex h-full min-h-0 flex-col p-3">
            <span className="mb-2 text-muted-foreground text-xs">SQL</span>
            <Textarea
              aria-label={m.sqlEditor}
              className="h-full min-h-0 flex-1 resize-none"
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
            <div className="database-grid min-h-0 flex-1 overflow-auto bg-background">
              {error && (
                <Alert className="m-3 w-auto" variant="destructive">
                  <HugeiconsIcon icon={AlertCircleIcon} />
                  <AlertTitle>{m.queryError}</AlertTitle>
                  <AlertDescription>
                    <pre className="whitespace-pre-wrap break-all">{error}</pre>
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
                <Table
                  className="w-(--database-table-width) table-fixed"
                  style={tableStyle}
                >
                  <TableHeader variant="sticky">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      {resultColumns.map((col) => (
                        <DatabaseColumnHeader
                          fitWidth={fitDatabaseColumn(
                            col,
                            results.map((row) => row[col])
                          )}
                          key={col}
                          name={col}
                          onResize={(width) => columnLayout.resize(col, width)}
                          width={columnLayout.width(col)}
                        />
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
                            <DatabaseCellMenu
                              key={col}
                              onInspect={() =>
                                setInspectCell({ columnName: col, value: val })
                              }
                              row={row}
                              value={val}
                            >
                              <TableCell size="compact" variant="mono">
                                <Button
                                  onClick={() =>
                                    setInspectCell({
                                      columnName: col,
                                      value: val,
                                    })
                                  }
                                  size="database-cell"
                                  title={m.inspect}
                                  variant="ghost"
                                >
                                  {isNull ? (
                                    <span className="text-muted-foreground italic">
                                      NULL
                                    </span>
                                  ) : (
                                    <span>{strVal}</span>
                                  )}
                                </Button>
                              </TableCell>
                            </DatabaseCellMenu>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {results && results.length === 0 && !error && (
                <Empty size="compact">
                  <EmptyHeader>
                    <EmptyDescription>{m.queryEmpty}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {!results && affectedRows === null && !error && (
                <Empty className="h-full" size="compact">
                  <EmptyHeader>
                    <EmptyDescription>
                      {isRunning ? m.loading : m.queryHint}
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
