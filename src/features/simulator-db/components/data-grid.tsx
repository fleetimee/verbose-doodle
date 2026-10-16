import {
  ArrowExpandIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Copy01Icon,
  Download01Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
import { DatabaseCellMenu } from "@/features/simulator-db/components/database-cell-menu";
import {
  DatabaseColumnHeader,
  fitDatabaseColumn,
  useDatabaseColumns,
} from "@/features/simulator-db/components/database-column-header";
import { DeleteRowDialog } from "@/features/simulator-db/components/delete-row-dialog";
import {
  InlineCellEditor,
  useInlineCellEdit,
} from "@/features/simulator-db/components/inline-cell-editor";
import { RowEditDialog } from "@/features/simulator-db/components/row-edit-dialog";
import type {
  SqlCellValue,
  SqlRow,
  TableDataPage,
} from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";
import { cn } from "@/lib/utils";

type DataGridProps = {
  readonly onEditStateChange?: (state: "idle" | "editing" | "saving") => void;
  readonly currentSortBy?: string;
  readonly currentSortDir?: "asc" | "desc";
  readonly data: TableDataPage | null;
  readonly isLoading: boolean;
  readonly onMutationSuccess?: (isNewRow: boolean) => void;
  readonly onPageChange: (newPage: number) => void;
  readonly onRefresh: () => void;
  readonly onSearchChange?: (query: string) => void;
  readonly onSizeChange: (newSize: number) => void;
  readonly onSortChange: (column: string) => void;
  readonly searchQuery?: string;
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

function getGridPagination(data: TableDataPage | null) {
  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalRows / data.size))
    : 1;
  const currentPage = data ? data.page : 0;
  const startRow = data && data.totalRows > 0 ? currentPage * data.size + 1 : 0;
  const endRow = Math.min(
    (currentPage + 1) * (data?.size ?? 0),
    data?.totalRows ?? 0
  );
  return { totalPages, currentPage, startRow, endRow };
}

export function DataGrid({
  onEditStateChange,
  currentSortBy,
  currentSortDir,
  data,
  isLoading,
  onMutationSuccess,
  onPageChange,
  onRefresh,
  onSearchChange,
  onSizeChange,
  onSortChange,
  searchQuery,
}: DataGridProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const notifyMutationSuccess = onMutationSuccess ?? onRefresh;
  const [editToolbar, setEditToolbar] = useState<HTMLDivElement | null>(null);
  const { activeEdit, setActiveEdit, setIsSavingEdit, isSavingEdit } =
    useInlineCellEdit(onEditStateChange);
  const [wrapText, setWrapText] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery ?? "");
  const [inspectCell, setInspectCell] = useState<{
    columnName: string;
    value: SqlCellValue;
  } | null>(null);

  useEffect(() => {
    setSearchInput(searchQuery ?? "");
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange && searchInput !== (searchQuery ?? "")) {
        onSearchChange(searchInput);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, searchQuery, onSearchChange]);

  const [rowModal, setRowModal] = useState<{
    mode: "add" | "edit" | "clone";
    open: boolean;
    row: SqlRow | null;
  }>({
    mode: "add",
    open: false,
    row: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    row: SqlRow | null;
  }>({
    open: false,
    row: null,
  });

  const columns = useMemo(() => data?.columns ?? [], [data]);
  const rawRows = useMemo(() => data?.rows ?? [], [data]);
  const filteredRows = rawRows;
  const defaultWidths = useMemo(
    () =>
      Object.fromEntries(
        columns.map((col) => [
          col.name,
          Math.min(
            480,
            fitDatabaseColumn(
              col.name,
              rawRows.map((row) => row[col.name])
            )
          ),
        ])
      ),
    [columns, rawRows]
  );
  const columnLayout = useDatabaseColumns(defaultWidths);

  const { totalPages, currentPage, startRow, endRow } = getGridPagination(data);

  const handleExportCsv = () => {
    if (!data || rawRows.length === 0) {
      return;
    }
    const header = columns.map((c) => `"${c.name}"`).join(",");
    const body = rawRows
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.name];
            if (val === null || val === undefined) {
              return "";
            }
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.tableName}-page-${currentPage + 1}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    if (!rawRows.length) {
      return;
    }
    await copyDatabaseValue(JSON.stringify(rawRows, null, 2));
  };

  const tableStyle: CSSProperties & { "--database-table-width": string } = {
    "--database-table-width": `${64 + columns.reduce((total, col) => total + columnLayout.width(col.name), 0)}px`,
  };

  if (!data && isLoading) {
    return (
      <Empty className="h-full" size="compact">
        <EmptyHeader>
          <RefreshCw className="size-4 animate-spin" />
          <EmptyDescription>{m.loading}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data) {
    return (
      <Empty className="h-full" size="compact">
        <EmptyHeader>
          <EmptyDescription>{m.selectTable}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div
      className="database-data-pane flex h-full min-h-0 flex-col"
      data-wrap={wrapText}
    >
      {/* DataGrip Action Toolbar */}
      <div className="database-toolbar flex shrink-0 flex-wrap items-center justify-start gap-2 border-b px-2 py-1">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1" ref={setEditToolbar} />
          <Button
            aria-label={m.addRow}
            disabled={isLoading || isSavingEdit}
            onClick={() => setRowModal({ mode: "add", open: true, row: null })}
            size="icon-xs"
            title={m.addRow}
          >
            <Plus className="mr-1 size-3.5" />
          </Button>

          <Button
            aria-label={m.refresh}
            disabled={isLoading || isSavingEdit}
            onClick={onRefresh}
            size="icon-xs"
            title={m.refresh}
            variant="ghost"
          >
            <RefreshCw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
          </Button>

          <Separator className="h-4" orientation="vertical" />

          {/* Table quick search */}
          <div className="w-40">
            <Input
              disabled={isSavingEdit}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search all rows in table..."
              size="xs"
              value={searchInput}
              variant="search-field"
            />
          </div>

          <span className="whitespace-nowrap text-muted-foreground text-xs tabular-nums">
            {startRow.toLocaleString()}–{endRow.toLocaleString()} of{" "}
            {data.totalRows.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Toggle
            aria-label={m.wrapText}
            onPressedChange={setWrapText}
            pressed={wrapText}
            size="icon-xs"
            title={m.wrapText}
          >
            <HugeiconsIcon icon={TextWrapIcon} />
          </Toggle>
          <Button
            aria-label={m.resetWidths}
            onClick={columnLayout.reset}
            size="icon-xs"
            title={m.resetWidths}
            variant="ghost"
          >
            <HugeiconsIcon icon={ArrowExpandIcon} />
          </Button>
          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Select
              disabled={isSavingEdit}
              onValueChange={(val) => onSizeChange(Number(val))}
              value={String(data.size)}
            >
              <SelectTrigger aria-label="Page size" className="h-6 w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator className="h-4" orientation="vertical" />

          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            <Button
              disabled={currentPage <= 0 || isLoading || isSavingEdit}
              onClick={() => onPageChange(0)}
              size="icon-xs"
              title="First page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowLeftDoubleIcon} />
            </Button>
            <Button
              disabled={currentPage <= 0 || isLoading || isSavingEdit}
              onClick={() => onPageChange(currentPage - 1)}
              size="icon-xs"
              title="Previous page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronLeftIcon} />
            </Button>
            <span className="px-1 text-muted-foreground text-xs tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={
                currentPage >= totalPages - 1 || isLoading || isSavingEdit
              }
              onClick={() => onPageChange(currentPage + 1)}
              size="icon-xs"
              title="Next page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronRightIcon} />
            </Button>
            <Button
              disabled={
                currentPage >= totalPages - 1 || isLoading || isSavingEdit
              }
              onClick={() => onPageChange(totalPages - 1)}
              size="icon-xs"
              title="Last page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowRightDoubleIcon} />
            </Button>
          </div>

          {/* Export button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Export"
                size="icon-xs"
                title="Export"
                variant="ghost"
              >
                <HugeiconsIcon className="size-3.5" icon={Download01Icon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleExportCsv}>
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyJson}>
                  Copy Page as JSON
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Container */}
      <div className="database-grid relative min-h-0 flex-1 overflow-auto bg-background">
        <Table
          className="w-(--database-table-width) table-fixed"
          style={tableStyle}
        >
          <TableHeader variant="sticky">
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead className="w-8">
                <span className="sr-only">{m.rowActions}</span>
              </TableHead>
              {columns.map((col) => (
                <DatabaseColumnHeader
                  fitWidth={fitDatabaseColumn(
                    col.name,
                    rawRows.map((row) => row[col.name])
                  )}
                  key={col.name}
                  name={col.name}
                  onResize={(width) => columnLayout.resize(col.name, width)}
                  onSort={() => {
                    if (!activeEdit) {
                      onSortChange(col.name);
                    }
                  }}
                  primaryKey={Boolean(col.primaryKey)}
                  sortDirection={
                    currentSortBy === col.name ? currentSortDir : undefined
                  }
                  tableName={data.tableName}
                  type={col.type || "ANY"}
                  width={columnLayout.width(col.name)}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} variant="muted">
                  <Empty size="compact">
                    <EmptyHeader>
                      <EmptyDescription>{m.noRows}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, idx) => {
                const rowNum = startRow + idx;
                return (
                  <TableRow key={rowNum}>
                    <TableCell size="compact" variant="muted">
                      <span className="tabular-nums">{rowNum}</span>
                    </TableCell>
                    <TableCell size="compact" variant="muted">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={m.rowActions}
                            disabled={isSavingEdit}
                            size="grid-icon"
                            variant="ghost"
                          >
                            <HugeiconsIcon icon={MoreHorizontalIcon} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() =>
                                setRowModal({ mode: "edit", open: true, row })
                              }
                            >
                              <HugeiconsIcon icon={Edit02Icon} />
                              {m.editRow}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setRowModal({ mode: "clone", open: true, row })
                              }
                            >
                              <HugeiconsIcon icon={Copy01Icon} />
                              {m.cloneRow}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteModal({ open: true, row })
                              }
                              variant="destructive"
                            >
                              <Trash2 />
                              {m.deleteRow}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const strVal = formatCellValue(val);

                      if (
                        activeEdit?.rowIndex === idx &&
                        activeEdit.column.name === col.name
                      ) {
                        return (
                          <TableCell
                            key={col.name}
                            size="compact"
                            variant="mono"
                          >
                            <InlineCellEditor
                              column={activeEdit.column}
                              columns={columns}
                              onCancel={() => setActiveEdit(null)}
                              onSaved={() => {
                                setActiveEdit(null);
                                if (onMutationSuccess) {
                                  onMutationSuccess(false);
                                } else {
                                  onRefresh();
                                }
                              }}
                              onSavingChange={setIsSavingEdit}
                              row={activeEdit.row}
                              tableName={data.tableName}
                              toolbar={editToolbar}
                            />
                          </TableCell>
                        );
                      }

                      return (
                        <DatabaseCellMenu
                          key={col.name}
                          {...(!activeEdit && {
                            onClone: () =>
                              setRowModal({ mode: "clone", open: true, row }),
                            onDelete: () => setDeleteModal({ open: true, row }),
                            onEdit: () =>
                              setRowModal({ mode: "edit", open: true, row }),
                          })}
                          onInspect={() =>
                            setInspectCell({ columnName: col.name, value: val })
                          }
                          row={row}
                          value={val}
                        >
                          <TableCell size="compact" variant="mono">
                            <Button
                              disabled={isLoading || isSavingEdit}
                              onDoubleClick={() =>
                                setActiveEdit({
                                  rowIndex: idx,
                                  row,
                                  column: col,
                                })
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key === "F2" ||
                                  event.key === "Enter"
                                ) {
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
        </Table>
      </div>

      {/* Cell Inspect Dialog */}
      <CellDetailDialog
        columnName={inspectCell?.columnName ?? null}
        onOpenChange={(open) => !open && setInspectCell(null)}
        open={Boolean(inspectCell)}
        value={inspectCell?.value ?? null}
      />

      {/* Row Edit / Add / Clone Dialog */}
      <RowEditDialog
        columns={columns}
        initialRow={rowModal.row}
        mode={rowModal.mode}
        onOpenChange={(open) => setRowModal((prev) => ({ ...prev, open }))}
        onSuccess={(isNewRow) => {
          notifyMutationSuccess(isNewRow);
        }}
        open={rowModal.open}
        tableName={data.tableName}
      />

      {/* Delete Row Dialog */}
      <DeleteRowDialog
        columns={columns}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        onSuccess={() => {
          notifyMutationSuccess(false);
        }}
        open={deleteModal.open}
        row={deleteModal.row}
        tableName={data.tableName}
      />
    </div>
  );
}
