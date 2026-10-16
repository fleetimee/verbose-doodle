import { type Dispatch, memo, type SetStateAction } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DatabaseCellMenu } from "@/features/simulator-db/components/database-cell-menu";
import {
  type InlineCellDraft,
  InlineCellEditor,
} from "@/features/simulator-db/components/inline-cell-editor";
import type {
  ColumnMetadata,
  SqlCellValue,
  SqlRow,
} from "@/features/simulator-db/types";

type DatabaseGridRowsProps = {
  readonly rows: readonly SqlRow[];
  readonly columns: readonly ColumnMetadata[];
  readonly tableName: string;
  readonly startRow: number;
  readonly activeEdit: InlineCellDraft | null;
  readonly isBusy: boolean;
  readonly isSavingEdit: boolean;
  readonly hasError: boolean;
  readonly editToolbar: HTMLDivElement | null;
  readonly setActiveEdit: Dispatch<SetStateAction<InlineCellDraft | null>>;
  readonly setIsSavingEdit: Dispatch<SetStateAction<boolean>>;
  readonly setRowModal: Dispatch<
    SetStateAction<{
      mode: "add" | "edit" | "clone";
      open: boolean;
      row: SqlRow | null;
    }>
  >;
  readonly setDeleteModal: Dispatch<
    SetStateAction<{ open: boolean; row: SqlRow | null }>
  >;
  readonly setInspectCell: Dispatch<
    SetStateAction<{ columnName: string; value: SqlCellValue } | null>
  >;
  readonly onSaved: () => void;
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

function renderCellBadge(val: SqlCellValue, strVal: string) {
  if (val === null || val === undefined) {
    return <span className="text-muted-foreground/60 italic">NULL</span>;
  }
  if (isBoolean(val)) {
    return (
      <Badge size="xs" variant={val ? "default" : "secondary"}>
        {String(val)}
      </Badge>
    );
  }
  return <span className="truncate">{strVal}</span>;
}

export const DatabaseGridRows = memo(function DatabaseGridRows({
  rows,
  columns,
  tableName,
  startRow,
  activeEdit,
  isBusy,
  isSavingEdit,
  hasError,
  editToolbar,
  setActiveEdit,
  setIsSavingEdit,
  setRowModal,
  setDeleteModal,
  setInspectCell,
  onSaved,
}: DatabaseGridRowsProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  return (
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={columns.length + 1} variant="muted">
            <Empty size="compact">
              <EmptyHeader>
                <EmptyDescription>{m.noRows}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row, idx) => {
          const rowNum = startRow + idx;
          return (
            <TableRow key={rowNum}>
              <TableCell size="compact" variant="muted">
                <span className="tabular-nums">{rowNum}</span>
              </TableCell>
              {columns.map((col) => {
                const val = row[col.name];
                const strVal = formatCellValue(val);

                if (
                  activeEdit?.rowIndex === idx &&
                  activeEdit.column.name === col.name
                ) {
                  return (
                    <TableCell key={col.name} size="compact" variant="mono">
                      <InlineCellEditor
                        column={activeEdit.column}
                        columns={columns}
                        onCancel={() => setActiveEdit(null)}
                        onSaved={onSaved}
                        onSavingChange={setIsSavingEdit}
                        row={activeEdit.row}
                        tableName={tableName}
                        toolbar={editToolbar}
                      />
                    </TableCell>
                  );
                }

                return (
                  <DatabaseCellMenu
                    key={col.name}
                    {...(!(activeEdit || isBusy || hasError) && {
                      onClone: () =>
                        setRowModal({ mode: "clone", open: true, row }),
                      onDelete: () => setDeleteModal({ open: true, row }),
                      onEdit: () =>
                        setRowModal({ mode: "edit", open: true, row }),
                    })}
                    onInspect={() =>
                      setInspectCell({
                        columnName: col.name,
                        value: val,
                      })
                    }
                    row={row}
                    value={val}
                  >
                    <TableCell size="compact" variant="mono">
                      <Button
                        disabled={isBusy || isSavingEdit || hasError}
                        onDoubleClick={() =>
                          setActiveEdit({
                            rowIndex: idx,
                            row,
                            column: col,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "F2" || event.key === "Enter") {
                            event.preventDefault();
                            setActiveEdit({
                              rowIndex: idx,
                              row,
                              column: col,
                            });
                          }
                        }}
                        size="database-cell"
                        title={m.editValue}
                        variant="ghost"
                      >
                        {renderCellBadge(val, strVal)}
                      </Button>
                    </TableCell>
                  </DatabaseCellMenu>
                );
              })}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
});
