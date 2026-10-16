import {
  ArrowDown01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Copy01Icon,
  Download01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
import { DeleteRowDialog } from "@/features/simulator-db/components/delete-row-dialog";
import { RowEditDialog } from "@/features/simulator-db/components/row-edit-dialog";
import type {
  SqlCellValue,
  SqlRow,
  TableDataPage,
} from "@/features/simulator-db/types";
import { cn } from "@/lib/utils";

type DataGridProps = {
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

function getSortIcon(isSorted: boolean, dir?: "asc" | "desc") {
  if (!isSorted) {
    return ArrowUpDownIcon;
  }
  return dir === "desc" ? ArrowDown01Icon : ArrowUp01Icon;
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

export function DataGrid({
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

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalRows / data.size))
    : 1;
  const currentPage = data ? data.page : 0;
  const startRow = data && data.totalRows > 0 ? currentPage * data.size + 1 : 0;
  const endRow =
    data && data.totalRows > 0
      ? Math.min((currentPage + 1) * data.size, data.totalRows)
      : 0;

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
    await navigator.clipboard.writeText(JSON.stringify(rawRows, null, 2));
  };

  if (!data && isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="mr-2 size-4 animate-spin text-primary" />
        Loading table data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Select a table from the explorer to view records.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* DataGrip Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <Button
            disabled={isLoading}
            onClick={() => setRowModal({ mode: "add", open: true, row: null })}
            size="xs"
            title="Add new row (INSERT)"
          >
            <Plus className="mr-1 size-3.5" />
            Add Row
          </Button>

          <Button
            disabled={isLoading}
            onClick={onRefresh}
            size="xs"
            title="Reload table data"
            variant="ghost"
          >
            <RefreshCw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
            Refresh
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Table quick search */}
          <div className="w-52">
            <Input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search all rows in table..."
              size="xs"
              value={searchInput}
              variant="search-field"
            />
          </div>

          <span className="text-muted-foreground text-xs tabular-nums">
            Showing {startRow.toLocaleString()}–{endRow.toLocaleString()} of{" "}
            {data.totalRows.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span>Page size:</span>
            <Select
              onValueChange={(val) => onSizeChange(Number(val))}
              value={String(data.size)}
            >
              <SelectTrigger className="h-7 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            <Button
              disabled={currentPage <= 0 || isLoading}
              onClick={() => onPageChange(0)}
              size="icon-xs"
              title="First page"
              variant="outline"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowLeftDoubleIcon} />
            </Button>
            <Button
              disabled={currentPage <= 0 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              size="icon-xs"
              title="Previous page"
              variant="outline"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronLeftIcon} />
            </Button>
            <span className="px-1 text-muted-foreground text-xs tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              size="icon-xs"
              title="Next page"
              variant="outline"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronRightIcon} />
            </Button>
            <Button
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => onPageChange(totalPages - 1)}
              size="icon-xs"
              title="Last page"
              variant="outline"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowRightDoubleIcon} />
            </Button>
          </div>

          {/* Export button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" variant="outline">
                <HugeiconsIcon className="size-3.5" icon={Download01Icon} />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCsv}>
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyJson}>
                Copy Page as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative flex-1 overflow-auto bg-background">
        <Table>
          <TableHeader variant="sticky">
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="w-24 text-center">Actions</TableHead>
              {columns.map((col) => {
                const isSorted = currentSortBy === col.name;
                const sortIcon = getSortIcon(isSorted, currentSortDir);

                return (
                  <TableHead
                    className="cursor-pointer select-none"
                    key={col.cid}
                    onClick={() => onSortChange(col.name)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="truncate font-semibold text-foreground">
                          {col.name}
                        </span>
                        {col.primaryKey && (
                          <Badge size="xs" variant="secondary">
                            PK
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs uppercase">
                          {col.type || "ANY"}
                        </span>
                      </div>
                      <HugeiconsIcon
                        className={cn(
                          "size-3 shrink-0 text-muted-foreground transition-opacity",
                          isSorted ? "text-primary opacity-100" : "opacity-30"
                        )}
                        icon={sortIcon}
                      />
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} variant="muted">
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    {searchInput.trim()
                      ? `No rows matching "${searchInput}"`
                      : "Table is empty (0 rows)"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, idx) => {
                const rowNum = startRow + idx;
                return (
                  <TableRow
                    key={rowNum}
                    onDoubleClick={() =>
                      setRowModal({ mode: "edit", open: true, row })
                    }
                  >
                    <TableCell size="compact" variant="muted">
                      <span className="tabular-nums">{rowNum}</span>
                    </TableCell>
                    <TableCell size="compact" variant="muted">
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowModal({ mode: "edit", open: true, row });
                          }}
                          size="icon-xs"
                          title="Edit row (UPDATE)"
                          variant="ghost"
                        >
                          <HugeiconsIcon
                            className="size-3.5"
                            icon={Edit02Icon}
                          />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowModal({ mode: "clone", open: true, row });
                          }}
                          size="icon-xs"
                          title="Clone row (INSERT duplicate)"
                          variant="ghost"
                        >
                          <HugeiconsIcon
                            className="size-3.5"
                            icon={Copy01Icon}
                          />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, row });
                          }}
                          size="icon-xs"
                          title="Delete row (DELETE)"
                          variant="ghost-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const strVal = formatCellValue(val);

                      return (
                        <TableCell
                          key={col.name}
                          onClick={() =>
                            setInspectCell({
                              columnName: col.name,
                              value: val,
                            })
                          }
                          size="compact"
                          variant="mono"
                        >
                          <div
                            className="max-w-[260px] cursor-pointer truncate"
                            title="Click to view details"
                          >
                            {renderCellBadge(val, strVal)}
                          </div>
                        </TableCell>
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
          if (onMutationSuccess) {
            onMutationSuccess(isNewRow);
          } else {
            onRefresh();
          }
        }}
        open={rowModal.open}
        tableName={data.tableName}
      />

      {/* Delete Row Dialog */}
      <DeleteRowDialog
        columns={columns}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        onSuccess={() => {
          if (onMutationSuccess) {
            onMutationSuccess(false);
          } else {
            onRefresh();
          }
        }}
        open={deleteModal.open}
        row={deleteModal.row}
        tableName={data.tableName}
      />
    </div>
  );
}
