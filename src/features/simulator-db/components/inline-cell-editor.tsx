import { Cancel01Icon, FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { executeSqlStatement } from "@/features/simulator-db/api";
import {
  type ColumnMetadata,
  extractErrorMessage,
  type SqlRow,
} from "@/features/simulator-db/types";
import { buildCellUpdateSql } from "@/features/simulator-db/utils/sql-builder";

type InlineCellEditorProps = {
  readonly toolbar: HTMLDivElement | null;
  readonly column: ColumnMetadata;
  readonly columns: readonly ColumnMetadata[];
  readonly row: SqlRow;
  readonly tableName: string;
  readonly onCancel: () => void;
  readonly onSaved: () => void;
  readonly onSavingChange: (saving: boolean) => void;
};

export function InlineCellEditor({
  toolbar,
  column,
  columns,
  row,
  tableName,
  onCancel,
  onSaved,
  onSavingChange,
}: InlineCellEditorProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const initialValue = row[column.name];
  const initiallyNull = initialValue === null || initialValue === undefined;
  const [value, setValue] = useState(initiallyNull ? "" : String(initialValue));
  const [isNull, setIsNull] = useState(initiallyNull);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const cancelOutside = (event: PointerEvent) => {
      const target = event.target;
      if (
        !savingRef.current &&
        target instanceof Node &&
        !inputRef.current?.contains(target) &&
        !toolbar?.contains(target)
      ) {
        onCancel();
      }
    };
    document.addEventListener("pointerdown", cancelOutside, true);
    return () =>
      document.removeEventListener("pointerdown", cancelOutside, true);
  }, [onCancel, toolbar]);

  const save = async () => {
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    setSaving(true);
    onSavingChange(true);
    try {
      const result = await executeSqlStatement(
        buildCellUpdateSql(tableName, columns, row, column, { isNull, value })
      );
      if (result.affectedRows !== 1) {
        throw new Error(m.valueNotUpdated);
      }
      toast.success(m.valueSaved);
      onSaved();
    } catch (cause: unknown) {
      toast.error(extractErrorMessage(cause));
      inputRef.current?.focus();
    } finally {
      savingRef.current = false;
      setSaving(false);
      onSavingChange(false);
    }
  };

  return (
    <>
      <Input
        aria-label={`${m.editRow}: ${column.name}`}
        disabled={saving}
        onBlur={(event) => {
          if (!(savingRef.current || toolbar?.contains(event.relatedTarget))) {
            onCancel();
          }
        }}
        onChange={(event) => {
          setValue(event.target.value);
          setIsNull(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !saving) {
            event.preventDefault();
            onCancel();
          }
          if (event.key === "Enter") {
            event.preventDefault();
            save().catch(() => undefined);
          }
        }}
        placeholder={isNull ? "NULL" : undefined}
        ref={inputRef}
        size="grid"
        value={isNull ? "" : value}
        variant="grid-cell"
      />
      {toolbar &&
        createPortal(
          <>
            <Button
              aria-label={m.saveValue}
              disabled={saving}
              onClick={save}
              size="icon-xs"
              title={m.saveValue}
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
            {!column.notNull && (
              <Button
                aria-pressed={isNull}
                disabled={saving}
                onClick={() => {
                  setIsNull(!isNull);
                  inputRef.current?.focus();
                }}
                size="xs"
                title={m.setNull}
                variant="ghost"
              >
                NULL
              </Button>
            )}
          </>,
          toolbar
        )}
    </>
  );
}

export function useInlineCellEdit(
  onEditStateChange?: (state: "idle" | "editing" | "saving") => void
) {
  const [activeEdit, setActiveEdit] = useState<{
    rowIndex: number;
    row: SqlRow;
    column: ColumnMetadata;
  } | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editState = isSavingEdit ? "saving" : "editing";
  useEffect(() => {
    onEditStateChange?.(activeEdit ? editState : "idle");
  }, [activeEdit, editState, onEditStateChange]);
  useEffect(() => () => onEditStateChange?.("idle"), [onEditStateChange]);
  useEffect(() => {
    if (!activeEdit) {
      return;
    }
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [activeEdit]);
  return { activeEdit, setActiveEdit, setIsSavingEdit, isSavingEdit };
}
