import {
  type CSSProperties,
  type Dispatch,
  memo,
  type SetStateAction,
  useMemo,
} from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatabaseCellMenu } from "@/features/simulator-db/components/database-cell-menu";
import {
  DatabaseColumnHeader,
  fitDatabaseColumn,
  useDatabaseColumns,
} from "@/features/simulator-db/components/database-column-header";
import type { SqlCellValue, SqlRow } from "@/features/simulator-db/types";

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

type QueryResultGridProps = {
  readonly results: readonly SqlRow[];
  readonly onInspect: Dispatch<
    SetStateAction<{ columnName: string; value: SqlCellValue } | null>
  >;
};
export const QueryResultGrid = memo(function QueryResultGrid({
  results,
  onInspect,
}: QueryResultGridProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const resultColumns = useMemo(
    () => (results.length > 0 ? Object.keys(results[0]) : []),
    [results]
  );
  const fitWidths = useMemo(
    () =>
      Object.fromEntries(
        resultColumns.map((col) => [
          col,
          fitDatabaseColumn(
            col,
            results.map((row) => row[col])
          ),
        ])
      ),
    [resultColumns, results]
  );
  const defaultWidths = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(fitWidths).map(([name, width]) => [
          name,
          Math.min(480, width),
        ])
      ),
    [fitWidths]
  );
  const columnLayout = useDatabaseColumns(defaultWidths);
  const tableStyle: CSSProperties & { "--database-table-width": string } = {
    "--database-table-width": `${48 + resultColumns.reduce((total, name) => total + columnLayout.width(name), 0)}px`,
  };
  return (
    <Table
      className="w-(--database-table-width) table-fixed"
      style={tableStyle}
    >
      <TableHeader variant="sticky">
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          {resultColumns.map((col) => (
            <DatabaseColumnHeader
              fitWidth={fitWidths[col] ?? 160}
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
                    onInspect({
                      columnName: col,
                      value: val,
                    })
                  }
                  row={row}
                  value={val}
                >
                  <TableCell size="compact" variant="mono">
                    <Button
                      onClick={() =>
                        onInspect({
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
  );
});
