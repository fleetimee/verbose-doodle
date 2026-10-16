import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CircleAlert, RefreshCw, Trash2 } from "@/components/hugeicons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { executeSqlStatement } from "@/features/simulator-db/api";
import {
  type ColumnMetadata,
  extractErrorMessage,
  type SqlRow,
} from "@/features/simulator-db/types";
import { buildDeleteSql } from "@/features/simulator-db/utils/sql-builder";

type DeleteRowDialogProps = {
  readonly columns: readonly ColumnMetadata[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
  readonly open: boolean;
  readonly row: SqlRow | null;
  readonly tableName: string;
};

export function DeleteRowDialog({
  columns,
  onOpenChange,
  onSuccess,
  open,
  row,
  tableName,
}: DeleteRowDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSql = useMemo(() => {
    if (!row) {
      return "";
    }
    return buildDeleteSql(tableName, columns, row);
  }, [tableName, columns, row]);

  // Display primary keys or top columns to identify the row clearly
  const identifyingKeys = useMemo(() => {
    if (!row) {
      return [];
    }
    const pkCols = columns.filter((c) => c.primaryKey);
    const targetCols = pkCols.length > 0 ? pkCols : columns.slice(0, 3);
    return targetCols.map((c) => {
      const val = row[c.name];
      return {
        name: c.name,
        value: val === null || val === undefined ? "NULL" : String(val),
      };
    });
  }, [columns, row]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!(row && deleteSql)) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const res = await executeSqlStatement(deleteSql);
      toast.success("Row deleted successfully", {
        description: `Affected rows: ${res.affectedRows}`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (cause: unknown) {
      setError(extractErrorMessage(cause));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </div>
            <div>
              <AlertDialogTitle>Delete Row</AlertDialogTitle>
              <AlertDialogDescription>
                Table:{" "}
                <span className="font-mono text-foreground">{tableName}</span>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground">
            Are you sure you want to delete this row? This action will
            permanently remove it from the remote SQLite database.
          </p>

          {/* Row Identifier Chips */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/20 p-2">
            <span className="font-medium text-muted-foreground text-xs">
              Target:
            </span>
            {identifyingKeys.map((item) => (
              <Badge key={item.name} size="xs" variant="outline">
                <span className="font-semibold text-foreground">
                  {item.name}:
                </span>{" "}
                <span className="font-mono text-muted-foreground">
                  {item.value}
                </span>
              </Badge>
            ))}
          </div>

          {/* SQL Preview */}
          <div className="rounded-md border bg-muted/40 p-2.5 font-mono text-foreground text-xs">
            <pre className="whitespace-pre-wrap">{deleteSql}</pre>
          </div>

          {error && (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            size="sm"
            variant="destructive"
          >
            {isDeleting ? (
              <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 size-3.5" />
            )}
            Delete Row
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
