import { useState } from "react";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnMetadata } from "@/features/simulator-db/types";

type TableStructureProps = {
  readonly columns: readonly ColumnMetadata[];
  readonly tableName: string | null;
};

export function TableStructure({ tableName, columns }: TableStructureProps) {
  const [copiedDdl, setCopiedDdl] = useState(false);

  if (!tableName) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Select a table to view its structure.
      </div>
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
    await navigator.clipboard.writeText(generatedDdl);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  return (
    <div className="flex h-full flex-col space-y-6 overflow-auto p-4">
      {/* Column Dictionary Table */}
      <div className="rounded-md border bg-card">
        <div className="border-b px-4 py-2.5">
          <h3 className="font-semibold text-xs tracking-tight">
            Columns ({columns.length})
          </h3>
          <p className="text-muted-foreground text-xs">
            Fields, types, and constraints for table{" "}
            <span className="font-medium font-mono text-foreground">
              {tableName}
            </span>
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Column Name</TableHead>
              <TableHead>Data Type</TableHead>
              <TableHead>Nullable</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Key</TableHead>
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
                    <span className="text-muted-foreground text-xs">YES</span>
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

      {/* Generated DDL Viewer */}
      <div className="rounded-md border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div>
            <h3 className="font-semibold text-xs tracking-tight">
              DDL Preview
            </h3>
            <p className="text-muted-foreground text-xs">
              Generated schema definition for SQLite
            </p>
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

        <div className="bg-muted/40 p-4">
          <pre className="select-text whitespace-pre-wrap font-mono text-foreground text-xs">
            {generatedDdl}
          </pre>
        </div>
      </div>
    </div>
  );
}
