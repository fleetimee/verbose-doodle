import { Cancel01Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { executeSqlStatement } from "@/features/simulator-db/api";
import {
  type ColumnMetadata,
  extractErrorMessage,
} from "@/features/simulator-db/types";
import { buildInsertSql } from "@/features/simulator-db/utils/sql-builder";

export function InlineNewRow({
  columns,
  tableName,
  toolbar,
  onCancel,
  onSaved,
  onEditStateChange,
}: {
  readonly columns: readonly ColumnMetadata[];
  readonly tableName: string;
  readonly toolbar: HTMLDivElement | null;
  readonly onCancel: () => void;
  readonly onSaved: () => void;
  readonly onEditStateChange?: (state: "idle" | "editing" | "saving") => void;
}) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const [fields, setFields] = useState<
    Record<string, { value: string; isNull: boolean }>
  >({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const firstInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstInput.current?.focus();
  }, []);
  useEffect(() => {
    onEditStateChange?.(saving ? "saving" : "editing");
    return () => onEditStateChange?.("idle");
  }, [saving, onEditStateChange]);
  useEffect(() => {
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, []);
  const save = async () => {
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await executeSqlStatement(buildInsertSql(tableName, columns, fields));
      toast.success(m.rowInserted);
      onSaved();
    } catch (cause: unknown) {
      toast.error(extractErrorMessage(cause));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return (
    <TableBody>
      <TableRow
        onKeyDown={(event) => {
          if (event.key === "Escape" && !savingRef.current) {
            event.preventDefault();
            onCancel();
          }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            save().catch(() => undefined);
          }
        }}
      >
        <TableCell size="compact" variant="muted">
          *
        </TableCell>
        {columns.map((column, index) => (
          <TableCell key={column.name} size="compact" variant="mono">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Input
                  aria-label={`${m.addRow}: ${column.name}`}
                  disabled={saving}
                  onChange={(event) =>
                    setFields((previous) => ({
                      ...previous,
                      [column.name]: {
                        value: event.target.value,
                        isNull: false,
                      },
                    }))
                  }
                  placeholder={
                    fields[column.name]?.isNull
                      ? "NULL"
                      : (column.defaultValue ?? "NULL")
                  }
                  ref={index === 0 ? firstInput : undefined}
                  size="grid"
                  value={fields[column.name]?.value ?? ""}
                  variant="grid-cell"
                />
              </ContextMenuTrigger>
              <ContextMenuContent size="compact" variant="macos">
                <ContextMenuGroup>
                  <ContextMenuItem
                    disabled={saving || column.notNull}
                    onClick={() =>
                      setFields((previous) => ({
                        ...previous,
                        [column.name]: { value: "", isNull: true },
                      }))
                    }
                  >
                    {m.setNull}
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={saving}
                    onClick={() =>
                      setFields((previous) => {
                        const next = { ...previous };
                        delete next[column.name];
                        return next;
                      })
                    }
                  >
                    {m.useDefault}
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          </TableCell>
        ))}
      </TableRow>
      {toolbar &&
        createPortal(
          <>
            <Button
              aria-label={m.saveRow}
              disabled={saving}
              onClick={save}
              size="icon-xs"
              title={m.saveRow}
            >
              <HugeiconsIcon icon={FloppyDiskIcon} />
            </Button>
            <Button
              aria-label={m.cancelEdit}
              disabled={saving}
              onClick={onCancel}
              size="icon-xs"
              title={m.cancelEdit}
              variant="ghost"
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Button>
          </>,
          toolbar
        )}
    </TableBody>
  );
}
