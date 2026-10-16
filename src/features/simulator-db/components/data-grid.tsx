import {
  ArrowExpandIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Download01Icon,
  TextWrapIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { CellDetailDialog } from "@/features/simulator-db/components/cell-detail-dialog";
import {
  DatabaseColumnHeader,
  fitDatabaseColumn,
  useDatabaseColumns,
} from "@/features/simulator-db/components/database-column-header";
import { DatabaseGridRows } from "@/features/simulator-db/components/database-grid-rows";
import {
  DatabaseGridFallback,
  DatabaseRefreshError,
  DatabaseRefreshIndicator,
} from "@/features/simulator-db/components/database-load-state";
import { DeleteRowDialog } from "@/features/simulator-db/components/delete-row-dialog";
import { useInlineCellEdit } from "@/features/simulator-db/components/inline-cell-editor";
import { InlineNewRow } from "@/features/simulator-db/components/inline-new-row";
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
  readonly error: string | null;
  readonly loadingLabel: string;
  readonly onRetry: () => void;
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

function useStableColumnLayout(
  defaultWidths: Record<string, number>,
  hasData: boolean
) {
  const [initialWidths, setInitialWidths] = useState<Record<
    string,
    number
  > | null>(null);
  if (hasData && !initialWidths) {
    setInitialWidths(defaultWidths);
  }
  return useDatabaseColumns(initialWidths ?? defaultWidths);
}

async function copyRowsJson(rows: readonly SqlRow[]) {
  if (rows.length > 0) {
    await copyDatabaseValue(JSON.stringify(rows, null, 2));
  }
}

function exportPageCsv(data: TableDataPage | null) {
  const rawRows = data?.rows ?? [];
  const columns = data?.columns ?? [];
  const currentPage = data?.page ?? 0;
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
}

function getGridInteractionState(
  saving: boolean,
  adding: boolean,
  editing: boolean,
  busy: boolean
) {
  const locked = saving || adding;
  return {
    locked,
    canSort: !(editing || busy || locked),
    rowsBusy: busy || adding,
  };
}

export function DataGrid({
  error,
  loadingLabel,
  onRetry,
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
  const handleCellSaved = useCallback(() => {
    setActiveEdit(null);
    notifyMutationSuccess(false);
  }, [notifyMutationSuccess, setActiveEdit]);
  const [isAdding, setIsAdding] = useState(false);
  const [wrapText, setWrapText] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery ?? "");
  const searchPending = searchInput !== (searchQuery ?? "");
  const isBusy = isLoading || searchPending;
  const statusLabel = searchPending ? m.searchingData : loadingLabel;
  const {
    locked: gridLocked,
    canSort,
    rowsBusy,
  } = getGridInteractionState(
    isSavingEdit,
    isAdding,
    Boolean(activeEdit),
    isBusy
  );
  const searchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    searchChangeRef.current = onSearchChange;
  }, [onSearchChange]);
  const [inspectCell, setInspectCell] = useState<{
    columnName: string;
    value: SqlCellValue;
  } | null>(null);

  useEffect(() => {
    setSearchInput(searchQuery ?? "");
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (searchQuery ?? "")) {
        searchChangeRef.current?.(searchInput);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, searchQuery]);

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
  const fitWidths = useMemo(
    () =>
      Object.fromEntries(
        columns.map((col) => [
          col.name,
          fitDatabaseColumn(
            col.name,
            rawRows.map((row) => row[col.name])
          ),
        ])
      ),
    [columns, rawRows]
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
  const columnLayout = useStableColumnLayout(defaultWidths, Boolean(data));

  const { totalPages, currentPage, startRow, endRow } = getGridPagination(data);

  const handleExportCsv = () => exportPageCsv(data);

  const handleCopyJson = () => copyRowsJson(rawRows);

  const tableStyle: CSSProperties & { "--database-table-width": string } = {
    "--database-table-width": `${32 + columns.reduce((total, col) => total + columnLayout.width(col.name), 0)}px`,
  };

  if (!data) {
    return (
      <DatabaseGridFallback
        error={error}
        isLoading={isLoading}
        label={loadingLabel}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div
      aria-busy={isBusy}
      className="database-data-pane flex h-full min-h-0 flex-col"
      data-wrap={wrapText}
    >
      <section
        aria-label={m.dataToolbar}
        className="database-toolbar flex shrink-0 items-center gap-2 overflow-x-auto border-b px-2 py-1"
      >
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            aria-label={m.addRow}
            disabled={isBusy || gridLocked || Boolean(error)}
            onClick={() => {
              setActiveEdit(null);
              setIsAdding(true);
            }}
            size="icon-xs"
            title={m.addRow}
            variant="ghost"
          >
            <Plus />
          </Button>

          <Button
            aria-label={m.refresh}
            disabled={isBusy || gridLocked || Boolean(error)}
            onClick={onRefresh}
            size="icon-xs"
            title={m.refresh}
            variant="ghost"
          >
            <RefreshCw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
          </Button>

          <div
            className="flex items-center gap-0.5 empty:hidden"
            ref={setEditToolbar}
          />
        </div>
        <Separator
          className="mx-1 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />{" "}
        <div className="flex shrink-0 items-center gap-1">
          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            <Button
              disabled={currentPage <= 0 || isBusy || gridLocked}
              onClick={() => onPageChange(0)}
              size="icon-xs"
              title="First page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowLeftDoubleIcon} />
            </Button>
            <Button
              disabled={currentPage <= 0 || isBusy || gridLocked}
              onClick={() => onPageChange(currentPage - 1)}
              size="icon-xs"
              title="Previous page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronLeftIcon} />
            </Button>
            <span className="min-w-16 px-1 text-center text-muted-foreground text-xs tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage >= totalPages - 1 || isBusy || gridLocked}
              onClick={() => onPageChange(currentPage + 1)}
              size="icon-xs"
              title="Next page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ChevronRightIcon} />
            </Button>
            <Button
              disabled={currentPage >= totalPages - 1 || isBusy || gridLocked}
              onClick={() => onPageChange(totalPages - 1)}
              size="icon-xs"
              title="Last page"
              variant="ghost"
            >
              <HugeiconsIcon className="size-3.5" icon={ArrowRightDoubleIcon} />
            </Button>
          </div>

          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Select
              disabled={gridLocked}
              onValueChange={(val) => onSizeChange(Number(val))}
              value={String(data.size)}
            >
              <SelectTrigger
                aria-label={m.pageSize}
                className="w-14"
                size="toolbar"
                variant="ghost"
              >
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
        </div>
        <Separator
          className="mx-1 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />{" "}
        <div className="flex shrink-0 items-center gap-0.5">
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
        <Separator
          className="mx-1 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />{" "}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-muted-foreground text-xs tabular-nums">
            {startRow.toLocaleString()}–{endRow.toLocaleString()} of{" "}
            {data.totalRows.toLocaleString()}
          </span>{" "}
          <div className="w-44 shrink-0">
            <Input
              aria-label={m.filterRows}
              disabled={gridLocked}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={m.filterRows}
              size="toolbar"
              value={searchInput}
              variant="search-field"
            />
          </div>
        </div>
      </section>

      {error && !isBusy && (
        <DatabaseRefreshError error={error} onRetry={onRetry} />
      )}
      {/* Grid Container */}
      <div className="database-grid relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
        <ScrollArea
          className="h-full min-h-0 w-full min-w-0"
          contentClassName="min-h-full"
          inert={isBusy || Boolean(error)}
          variant="fit"
        >
          <Table
            className="w-(--database-table-width) table-fixed"
            style={tableStyle}
          >
            <TableHeader variant="sticky">
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                {columns.map((col) => (
                  <DatabaseColumnHeader
                    fitWidth={fitWidths[col.name] ?? 160}
                    key={col.name}
                    name={col.name}
                    onResize={(width) => columnLayout.resize(col.name, width)}
                    onSort={() => {
                      if (canSort) {
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
            {isAdding && (
              <InlineNewRow
                columns={columns}
                onCancel={() => setIsAdding(false)}
                onEditStateChange={onEditStateChange}
                onSaved={() => {
                  setIsAdding(false);
                  notifyMutationSuccess(true);
                }}
                tableName={data.tableName}
                toolbar={editToolbar}
              />
            )}
            <DatabaseGridRows
              activeEdit={activeEdit}
              columns={columns}
              editToolbar={editToolbar}
              hasError={Boolean(error)}
              isBusy={rowsBusy}
              isSavingEdit={isSavingEdit}
              onSaved={handleCellSaved}
              rows={rawRows}
              setActiveEdit={setActiveEdit}
              setDeleteModal={setDeleteModal}
              setInspectCell={setInspectCell}
              setIsSavingEdit={setIsSavingEdit}
              setRowModal={setRowModal}
              startRow={startRow}
              tableName={data.tableName}
            />
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {isBusy && <DatabaseRefreshIndicator label={statusLabel} />}
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
