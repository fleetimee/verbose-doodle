import {
  type ColumnDef,
  type ColumnVisibilityState,
  columnVisibilityFeature,
  flexRender,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { ArrowUpDown, SlidersHorizontal } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type EndpointBillerGroupActions,
  EndpointBillerGroupHeader,
} from "@/features/endpoints/components/endpoint-biller-group-header";
import { EndpointCardViews } from "@/features/endpoints/components/endpoint-card-views";
import { EndpointCatalogEmpty } from "@/features/endpoints/components/endpoint-catalog-empty";
import { EndpointContextMenu } from "@/features/endpoints/components/endpoint-context-menu";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import type {
  EndpointListItem,
  EndpointListQuery,
  EndpointPage,
  EndpointViewMode,
} from "@/features/endpoints/types";
import { formatMessage } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
});
function ariaSort(value: false | "asc" | "desc") {
  if (value === "asc") {
    return "ascending";
  }
  if (value === "desc") {
    return "descending";
  }
  return "none";
}

const skeletonRows = ["one", "two", "three", "four", "five"];

function EndpointSortControls({
  query,
  onQueryChange,
}: {
  query: EndpointListQuery;
  onQueryChange: (query: EndpointListQuery) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.endpoints.table;
  const options = [
    { id: "url", label: messages.endpoints.urlLabel },
    { id: "method", label: messages.endpoints.globalConsole.method },
    { id: "billerName", label: messages.endpoints.billerLabel },
    { id: "enabled", label: copy.status },
  ];
  return (
    <ButtonGroup aria-label={copy.sortBy}>
      <Select
        onValueChange={(value) => {
          if (value) {
            onQueryChange({ ...query, page: 0, sortBy: value });
          }
        }}
        value={query.sortBy}
      >
        <SelectTrigger aria-label={copy.sortBy} size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        aria-label={
          query.direction === "asc" ? copy.ascending : copy.descending
        }
        onClick={() =>
          onQueryChange({
            ...query,
            page: 0,
            direction: query.direction === "asc" ? "desc" : "asc",
          })
        }
        size="icon-sm"
        title={query.direction === "asc" ? copy.ascending : copy.descending}
        variant="outline"
      >
        <ArrowUpDown />
      </Button>
    </ButtonGroup>
  );
}

function EndpointPagination({
  query,
  totalPages,
  onQueryChange,
  loading,
  fetching,
  error,
}: {
  query: EndpointListQuery;
  totalPages: number;
  onQueryChange: (query: EndpointListQuery) => void;
  loading: boolean;
  fetching: boolean;
  error: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.endpoints.table;
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-3 py-2">
      <Select
        disabled={loading}
        onValueChange={(value) =>
          onQueryChange({ ...query, page: 0, size: Number(value) })
        }
        value={String(query.size)}
      >
        <SelectTrigger aria-label={copy.perPage}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {formatMessage(copy.total, { count: size })}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">
          {formatMessage(copy.page, {
            page: totalPages === 0 ? 1 : query.page + 1,
            pages: Math.max(1, totalPages),
          })}
        </span>
        <Button
          disabled={fetching || error || query.page === 0}
          onClick={() => onQueryChange({ ...query, page: query.page - 1 })}
          size="sm"
          variant="outline"
        >
          {messages.common.previous}
        </Button>
        <Button
          disabled={fetching || error || query.page + 1 >= totalPages}
          onClick={() => onQueryChange({ ...query, page: query.page + 1 })}
          size="sm"
          variant="outline"
        >
          {messages.common.next}
        </Button>
      </div>
    </div>
  );
}

function EndpointViewPanel({
  fillHeight,
  children,
}: {
  fillHeight: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const present = useIsPresent();
  const enter = { opacity: 1, transform: "translateY(0)" };
  const initial = { opacity: 0, transform: "translateY(4px)" };
  const exit = {
    opacity: 0,
    transform: "translateY(-3px)",
    transition: { duration: MOTION_DURATION.viewExit, ease: MOTION_EASE.out },
  };
  return (
    <motion.div
      animate={enter}
      className={cn("min-w-0", fillHeight && "h-full")}
      exit={reduceMotion ? { opacity: 1, transition: { duration: 0 } } : exit}
      inert={!present}
      initial={reduceMotion ? false : initial}
      transition={{
        duration: reduceMotion ? 0 : MOTION_DURATION.step,
        ease: MOTION_EASE.out,
      }}
    >
      {children}
    </motion.div>
  );
}

function EndpointViewTransition({
  viewMode,
  fillHeight,
  children,
}: {
  viewMode: EndpointViewMode;
  fillHeight: boolean;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false} mode="wait">
      <EndpointViewPanel fillHeight={fillHeight} key={viewMode}>
        {children}
      </EndpointViewPanel>
    </AnimatePresence>
  );
}

export function EndpointTable({
  onAddEndpoint,
  onEditBiller,
  onReset,
  onCreate,
  viewMode,
  toolbar,
  data,
  query,
  onQueryChange,
  loading,
  fetching,
  error,
  onRetry,
  canEdit,
  actionPending,
  onEdit,
  onDelete,
}: {
  onReset: () => void;
  onCreate?: () => void;
  viewMode: EndpointViewMode;
  toolbar: ReactNode;
  data: EndpointPage | undefined;
  query: EndpointListQuery;
  onQueryChange: (query: EndpointListQuery) => void;
  loading: boolean;
  fetching: boolean;
  error: boolean;
  onRetry: () => void;
  canEdit: boolean;
  actionPending: boolean;
  onEdit: (endpoint: EndpointListItem) => void;
  onDelete: (endpoint: EndpointListItem) => void;
} & EndpointBillerGroupActions) {
  const { messages } = useI18n();
  const copy = messages.endpoints.table;
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [collapsedBillers, setCollapsedBillers] = useState<Set<string>>(
    new Set()
  );
  const toggleBiller = (slug: string) =>
    setCollapsedBillers((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  const columns: ColumnDef<typeof features, EndpointListItem>[] = [
    {
      accessorKey: "url",
      header: messages.endpoints.urlLabel,
      enableHiding: false,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className="block max-w-lg truncate font-medium font-mono text-sm underline-offset-4 hover:underline focus-visible:underline"
              id={row.index === 0 ? "endpoints-tour-first-endpoint" : undefined}
              to={`/dashboard/endpoints/${row.original.slug}`}
            >
              {row.original.url}
            </Link>
          </TooltipTrigger>
          <TooltipContent
            className="max-w-[min(520px,calc(100vw-2rem))] break-all"
            variant="mono"
          >
            {row.original.url}
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      accessorKey: "method",
      header: messages.endpoints.globalConsole.method,
      cell: ({ row }) => (
        <HttpMethodBadge method={row.original.method} variant="badge" />
      ),
    },
    {
      id: "billerName",
      accessorFn: (entry) => entry.billerName || entry.billerSlug,
      header: messages.endpoints.billerLabel,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block max-w-48 truncate">
              {row.original.billerName || row.original.billerSlug}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {row.original.billerName || row.original.billerSlug}
          </TooltipContent>
        </Tooltip>
      ),
    },
  ];
  const table = useTable({
    features,
    columns,
    data: error ? [] : (data?.endpoints ?? []),
    getRowId: (entry) => String(entry.id),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.totalPages ?? 0,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (update) => {
      const next = functionalUpdate(update, {
        pageIndex: query.page,
        pageSize: query.size,
      });
      onQueryChange({
        ...query,
        page: next.pageSize === query.size ? next.pageIndex : 0,
        size: next.pageSize,
      });
    },
    onSortingChange: (update) => {
      const next = functionalUpdate(update, [
        { id: query.sortBy, desc: query.direction === "desc" },
      ])[0];
      onQueryChange({
        ...query,
        page: 0,
        sortBy: next?.id ?? "url",
        direction: next?.desc ? "desc" : "asc",
      });
    },
    state: {
      columnVisibility,
      pagination: { pageIndex: query.page, pageSize: query.size },
      sorting: [{ id: query.sortBy, desc: query.direction === "desc" }],
    },
  });
  const count = table.getVisibleLeafColumns().length;
  const billerGroups = new Map<
    string,
    ReturnType<typeof table.getRowModel>["rows"]
  >();
  for (const row of table.getRowModel().rows) {
    const group = billerGroups.get(row.original.billerSlug) ?? [];
    group.push(row);
    billerGroups.set(row.original.billerSlug, group);
  }

  const showEmpty = !(loading || error || data?.endpoints.length);

  const renderTable = () => (
    <Table className={cn("min-w-2xl", showEmpty && "h-full")}>
      <TableHeader className="lg:sticky lg:top-0 lg:z-10" variant="sticky">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead
                aria-sort={ariaSort(header.column.getIsSorted())}
                key={header.id}
              >
                {header.column.getCanSort() ? (
                  <Button
                    onClick={() =>
                      header.column.toggleSorting(
                        header.column.getIsSorted() === "asc"
                      )
                    }
                    size="sm"
                    variant="ghost"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <ArrowUpDown />
                    <span className="sr-only">
                      {header.column.getIsSorted() === "desc"
                        ? copy.descending
                        : copy.ascending}
                    </span>
                  </Button>
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className={cn(showEmpty && "h-full")}>
        {loading
          ? skeletonRows.map((key) => (
              <TableRow aria-hidden="true" key={key}>
                {table.getVisibleLeafColumns().map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-5 w-24" variant="table" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : [...billerGroups].flatMap(([slug, rows]) => [
              <TableRow key={`biller:${slug}`} variant="host-group">
                <TableCell colSpan={count} variant="host-group">
                  <EndpointBillerGroupHeader
                    count={rows.length}
                    expanded={!collapsedBillers.has(slug)}
                    name={rows[0].original.billerName || slug}
                    onAddEndpoint={onAddEndpoint}
                    onEditBiller={onEditBiller}
                    onToggle={() => toggleBiller(slug)}
                    slug={slug}
                  />
                </TableCell>
              </TableRow>,
              ...(collapsedBillers.has(slug) ? [] : rows).map((row) => (
                <EndpointContextMenu
                  canEdit={canEdit && !actionPending && !fetching}
                  endpoint={row.original}
                  key={row.id}
                  onDelete={onDelete}
                  onEdit={onEdit}
                >
                  <TableRow tabIndex={canEdit ? 0 : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        size={cell.column.id === "url" ? "indented" : "default"}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </EndpointContextMenu>
              )),
            ])}
        {showEmpty && (
          <TableRow>
            <TableCell className="h-full" colSpan={count} variant="muted">
              <EndpointCatalogEmpty
                onCreate={onCreate}
                onReset={onReset}
                query={query}
              />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div
      aria-busy={fetching}
      className="flex min-w-0 flex-col overflow-hidden rounded-md border bg-background lg:min-h-0 lg:flex-1"
    >
      <div className="shrink-0 space-y-2 border-b p-2">{toolbar}</div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
        <span
          aria-live="polite"
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          {fetching && <Spinner />}
          {fetching
            ? messages.common.loading
            : formatMessage(copy.total, { count: data?.totalElements ?? 0 })}
        </span>
        {viewMode === "table" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="endpoints-table-columns" size="sm" variant="outline">
                <SlidersHorizontal />
                {copy.columns}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {String(column.columnDef.header)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <EndpointSortControls onQueryChange={onQueryChange} query={query} />
        )}
      </div>
      {error && (
        <Alert className="shrink-0" variant="destructive">
          <AlertDescription>
            <div className="flex items-center justify-between gap-3">
              {copy.error}
              <Button onClick={onRetry} size="sm" variant="outline">
                {copy.retry}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <ScrollArea
        className="min-w-0 overflow-hidden lg:min-h-0 lg:flex-1 [&_[data-slot=table-container]]:overflow-visible"
        contentClassName={cn(
          "w-full",
          showEmpty && "h-full [&_[data-slot=table-container]]:h-full"
        )}
        contentSize={showEmpty ? "default" : "table"}
        variant="fit"
      >
        <EndpointViewTransition fillHeight={showEmpty} viewMode={viewMode}>
          {viewMode === "table" ? (
            renderTable()
          ) : (
            <EndpointCardViews
              canEdit={canEdit && !actionPending && !fetching}
              collapsedBillers={collapsedBillers}
              endpoints={error ? [] : (data?.endpoints ?? [])}
              error={error}
              loading={loading}
              onAddEndpoint={onAddEndpoint}
              onDelete={onDelete}
              onEdit={onEdit}
              onEditBiller={onEditBiller}
              onToggleBiller={toggleBiller}
              viewMode={viewMode}
            />
          )}
        </EndpointViewTransition>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <EndpointPagination
        error={error}
        fetching={fetching}
        loading={loading}
        onQueryChange={onQueryChange}
        query={query}
        totalPages={data?.totalPages ?? 0}
      />
    </div>
  );
}
