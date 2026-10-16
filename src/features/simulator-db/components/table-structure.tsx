import { type CSSProperties, useState } from "react";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DatabaseColumnHeader,
  fitDatabaseColumn,
  useDatabaseColumns,
} from "@/features/simulator-db/components/database-column-header";
import type { ColumnMetadata } from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";

type TableStructureProps = {
  readonly columns: readonly ColumnMetadata[];
  readonly tableName: string | null;
};

export function TableStructure({ tableName, columns }: TableStructureProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const columnLayout = useDatabaseColumns();
  const [copiedDdl, setCopiedDdl] = useState(false);

  if (!tableName) {
    return (
      <Empty className="h-full" size="compact">
        <EmptyHeader>
          <EmptyDescription>{m.selectTable}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const generatedDdl = [
    `CREATE TABLE "${tableName}" (`,
    columns
      .map((col) => {
        const parts = [`  "${col.name}" ${col.type || "ANY"}`];
        if (col.primaryKey) {
          parts.push("PRIMARY KEY");
        }
        if (col.notNull) {
          parts.push("NOT NULL");
        }
        if (col.defaultValue !== null) {
          parts.push(`DEFAULT ${col.defaultValue}`);
        }
        return parts.join(" ");
      })
      .join(",\n"),
    ");",
  ].join("\n");

  const handleCopyDdl = async () => {
    if (await copyDatabaseValue(generatedDdl)) {
      setCopiedDdl(true);
      setTimeout(() => setCopiedDdl(false), 2000);
    }
  };

  const tableStyle: CSSProperties & { "--database-table-width": string } = {
    "--database-table-width": `${["#", "Column Name", "Data Type", "Nullable", "Default", "Key"].reduce((total, name) => total + columnLayout.width(name), 0)}px`,
  };

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize="60%" minSize="100px">
        <div className="flex h-full min-h-0 flex-col">
          {/* Column Dictionary Table */}
          <div className="database-toolbar shrink-0 border-b px-3 py-2">
            <h3 className="font-semibold text-xs tracking-tight">
              Columns ({columns.length})
            </h3>
          </div>
          <div className="database-grid min-h-0 flex-1 overflow-auto">
            <Table
              className="w-(--database-table-width) table-fixed"
              style={tableStyle}
            >
              <TableHeader>
                <TableRow>
                  {[
                    "#",
                    "Column Name",
                    "Data Type",
                    "Nullable",
                    "Default",
                    "Key",
                  ].map((name) => (
                    <DatabaseColumnHeader
                      fitWidth={fitDatabaseColumn(
                        name,
                        columns.map((col) =>
                          name === "Column Name" ? col.name : col.defaultValue
                        )
                      )}
                      key={name}
                      name={name}
                      onResize={(width) => columnLayout.resize(name, width)}
                      width={columnLayout.width(name)}
                    />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.cid}>
                    <TableCell size="compact" variant="mono">
                      {col.cid}
                    </TableCell>
                    <TableCell size="compact" variant="medium">
                      {col.name}
                    </TableCell>
                    <TableCell size="compact">
                      <Badge size="xs" variant="outline">
                        {col.type || "ANY"}
                      </Badge>
                    </TableCell>
                    <TableCell size="compact">
                      {col.notNull ? (
                        <Badge size="xs" variant="secondary">
                          NOT NULL
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          YES
                        </span>
                      )}
                    </TableCell>
                    <TableCell size="compact" variant="mono">
                      {col.defaultValue ?? "—"}
                    </TableCell>
                    <TableCell size="compact">
                      {col.primaryKey && (
                        <Badge size="xs" variant="default">
                          PRIMARY KEY
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle aria-label={m.ddl} className="h-px w-full" />
      <ResizablePanel minSize="100px">
        <div className="flex h-full min-h-0 flex-col">
          <div className="database-toolbar flex shrink-0 items-center justify-between border-b px-3 py-2">
            <div>
              <h3 className="font-semibold text-xs tracking-tight">{m.ddl}</h3>
            </div>
            <Button onClick={handleCopyDdl} size="xs" variant="outline">
              {copiedDdl ? (
                <>
                  <Check className="size-3.5 text-success" />
                  Copied DDL
                </>
              ) : (
                <>
                  <ClipboardCopy className="size-3.5" />
                  Copy DDL
                </>
              )}
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-3">
            <pre className="select-text whitespace-pre-wrap font-mono text-foreground text-xs">
              {generatedDdl}
            </pre>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
