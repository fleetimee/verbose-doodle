import { FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CircleAlert, Code2, RefreshCw } from "@/components/hugeicons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { executeSqlStatement } from "@/features/simulator-db/api";
import {
  type ColumnMetadata,
  extractErrorMessage,
  type SqlRow,
} from "@/features/simulator-db/types";
import {
  buildInsertSql,
  buildUpdateSql,
} from "@/features/simulator-db/utils/sql-builder";

type FieldState = {
  isNull: boolean;
  value: string;
};

type RowEditDialogProps = {
  readonly columns: readonly ColumnMetadata[];
  readonly initialRow: SqlRow | null;
  readonly mode: "add" | "edit" | "clone";
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: (isNewRow: boolean) => void;
  readonly open: boolean;
  readonly tableName: string;
};

function getFieldPlaceholder(
  isNull: boolean,
  defaultValue: string | null
): string {
  if (isNull) {
    return "NULL";
  }
  if (defaultValue) {
    return `Default: ${defaultValue}`;
  }
  return "Enter value...";
}

function getSuccessToastMessage(mode: "add" | "edit" | "clone"): string {
  if (mode === "edit") {
    return "Row updated successfully";
  }
  if (mode === "clone") {
    return "Row cloned and inserted successfully";
  }
  return "Row inserted successfully";
}

function getDialogTitle(mode: "add" | "edit" | "clone"): string {
  if (mode === "add") {
    return "Add New Row";
  }
  if (mode === "clone") {
    return "Clone Row";
  }
  return "Edit Row";
}

function isTabValue(v: string): v is "fields" | "preview" {
  return v === "fields" || v === "preview";
}

export function RowEditDialog({
  columns,
  initialRow,
  mode,
  onOpenChange,
  onSuccess,
  open,
  tableName,
}: RowEditDialogProps) {
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [activeTab, setActiveTab] = useState<"fields" | "preview">("fields");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize fields on open or change
  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    const initial: Record<string, FieldState> = {};
    for (const col of columns) {
      if (mode === "add") {
        initial[col.name] = {
          isNull: col.defaultValue === null && !col.notNull,
          value: col.defaultValue ?? "",
        };
      } else if (initialRow) {
        const val = initialRow[col.name];
        initial[col.name] = {
          isNull: val === null || val === undefined,
          value: val === null || val === undefined ? "" : String(val),
        };
      } else {
        initial[col.name] = { isNull: false, value: "" };
      }
    }
    setFields(initial);
    setError(null);
    setActiveTab("fields");
  }, [open, mode, columns, initialRow]);

  const generatedSql = useMemo(() => {
    if (mode === "edit" && initialRow) {
      return buildUpdateSql(tableName, columns, initialRow, fields);
    }
    return buildInsertSql(tableName, columns, fields);
  }, [mode, tableName, columns, initialRow, fields]);

  const handleFieldChange = (colName: string, val: string) => {
    setFields((prev) => ({
      ...prev,
      [colName]: {
        isNull: false,
        value: val,
      },
    }));
  };

  const handleToggleNull = (colName: string, checked: boolean) => {
    setFields((prev) => ({
      ...prev,
      [colName]: {
        isNull: checked,
        value: checked ? "" : (prev[colName]?.value ?? ""),
      },
    }));
  };

  const handleExecute = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await executeSqlStatement(generatedSql);
      toast.success(getSuccessToastMessage(mode), {
        description: `Affected rows: ${res.affectedRows}`,
      });
      onSuccess(mode !== "edit");
      onOpenChange(false);
    } catch (cause: unknown) {
      setError(extractErrorMessage(cause));
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = getDialogTitle(mode);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent size="2xl">
        <div className="border-b bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                Table:{" "}
                <span className="font-mono text-foreground">{tableName}</span>
              </DialogDescription>
            </DialogHeader>
            <Tabs
              onValueChange={(v) => {
                if (isTabValue(v)) {
                  setActiveTab(v);
                }
              }}
              value={activeTab}
            >
              <TabsList className="h-8">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="preview">
                  <Code2 className="mr-1 size-3.5" />
                  SQL Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2.5">
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {mode === "clone" && (
          <div className="border-b bg-muted/10 px-6 py-2 text-muted-foreground text-xs">
            Tip: A copy of this row's values has been loaded. Ensure primary
            keys or unique columns are adjusted before saving.
          </div>
        )}

        {activeTab === "fields" ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 px-6 py-4">
              {columns.map((col) => {
                const field = fields[col.name] ?? { isNull: false, value: "" };
                const isLongText =
                  field.value.length > 50 || field.value.includes("\n");

                return (
                  <div
                    className="grid gap-1.5 rounded-md border bg-card p-3"
                    key={col.cid}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label size="sm">{col.name}</Label>
                        {col.primaryKey && (
                          <Badge size="xs" variant="default">
                            PK
                          </Badge>
                        )}
                        <Badge size="xs" variant="outline">
                          {col.type || "ANY"}
                        </Badge>
                        {col.notNull && (
                          <span className="text-destructive text-xs">
                            *required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          checked={field.isNull}
                          id={`null-${col.name}`}
                          onCheckedChange={(checked) =>
                            handleToggleNull(col.name, checked === true)
                          }
                        />
                        <Label
                          className="cursor-pointer"
                          htmlFor={`null-${col.name}`}
                          size="xs"
                          variant="muted"
                        >
                          Set NULL
                        </Label>
                      </div>
                    </div>

                    {isLongText ? (
                      <Textarea
                        disabled={field.isNull}
                        onChange={(e) =>
                          handleFieldChange(col.name, e.target.value)
                        }
                        placeholder={getFieldPlaceholder(
                          field.isNull,
                          col.defaultValue
                        )}
                        rows={3}
                        size="xs"
                        value={field.isNull ? "" : field.value}
                        variant="mono"
                      />
                    ) : (
                      <Input
                        disabled={field.isNull}
                        onChange={(e) =>
                          handleFieldChange(col.name, e.target.value)
                        }
                        placeholder={getFieldPlaceholder(
                          field.isNull,
                          col.defaultValue
                        )}
                        size="sm"
                        value={field.isNull ? "" : field.value}
                        variant="mono"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6">
            <Label className="mb-2 block" size="sm" variant="muted">
              Statement to execute on remote SQLite database:
            </Label>
            <div className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-foreground text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap">{generatedSql}</pre>
            </div>
          </div>
        )}

        <DialogFooter variant="pane">
          <Button
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleExecute} size="sm">
            {isSubmitting ? (
              <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <HugeiconsIcon
                className="mr-1.5 size-3.5"
                icon={FloppyDiskIcon}
              />
            )}
            {mode === "edit" ? "Save Changes" : "Insert Row"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
