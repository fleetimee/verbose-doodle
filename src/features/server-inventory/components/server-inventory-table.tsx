import {
  Cancel01Icon,
  FullScreenIcon,
  MinimizeScreenIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  filterFn_equalsString,
  flexRender,
  functionalUpdate,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronDown,
  CopyIcon,
  ListFilter,
  Pen,
  Server,
  SlidersHorizontal,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revealServerPassword } from "@/features/server-inventory/api";
import { ServerAccessIcon } from "@/features/server-inventory/components/server-access-icon";
import { ServerEntryDetails } from "@/features/server-inventory/components/server-entry-details";
import { ServerInventoryFilter } from "@/features/server-inventory/components/server-inventory-filter";
import { ServerInventorySpreadsheetExport } from "@/features/server-inventory/components/server-inventory-spreadsheet-export";
import { ServerPasswordCell } from "@/features/server-inventory/components/server-password-cell";
import { ServerWebLink } from "@/features/server-inventory/components/server-web-link";
import { isWebUrl } from "@/features/server-inventory/server-form";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type InventoryStyle = CSSProperties & {
  "--table-min-width"?: string;
  "--column-width"?: string;
  "--fullscreen-origin"?: string;
};

const serverTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filterFns: { equalsString: filterFn_equalsString },
});

const loadingGroups = ["first", "second"] as const;
const loadingRows = ["first", "second", "third"] as const;

const AnimatedTableRow = motion.create(TableRow);
const rowTransition = {
  duration: 0.15,
  ease: [0.23, 1, 0.32, 1] as const,
};

function ServerTableLoadingRows({ columnIds }: { columnIds: string[] }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  return (
    <>
      {loadingGroups.flatMap((group) => [
        <TableRow
          aria-hidden="true"
          key={`loading-host:${group}`}
          variant="host-group"
        >
          <TableCell colSpan={columnIds.length} variant="host-group">
            <div className="flex h-8 items-center gap-2 px-3">
              <ChevronDown className="size-4 text-muted-foreground" />
              <Server className="size-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                {copy.host}
              </span>
              <Skeleton className="h-4 w-32" variant="table" />
            </div>
          </TableCell>
        </TableRow>,
        ...loadingRows.map((row) => (
          <TableRow aria-hidden="true" key={`loading-row:${group}:${row}`}>
            {columnIds.map((columnId) => (
              <TableCell
                key={columnId}
                size={columnId === "name" ? "indented" : "default"}
              >
                <div className="flex h-8 items-center">
                  <Skeleton
                    className={cn(
                      "h-4 max-w-full",
                      columnId === "name" ? "w-40" : "w-20"
                    )}
                    variant="table"
                  />
                </div>
              </TableCell>
            ))}
          </TableRow>
        )),
      ])}
    </>
  );
}

function formatServerHost(entry: ServerEntry) {
  if (entry.port === null) {
    return entry.host;
  }
  const host =
    entry.host.includes(":") && !entry.host.startsWith("[")
      ? `[${entry.host}]`
      : entry.host;
  return `${host}:${entry.port}`;
}

function getAriaSort(value: false | "asc" | "desc") {
  if (value === "asc") {
    return "ascending";
  }
  if (value === "desc") {
    return "descending";
  }
}

function SortHeader({
  column,
  label,
}: {
  column: Column<typeof serverTableFeatures, ServerEntry, unknown>;
  label: string;
}) {
  const { messages } = useI18n();
  return (
    <Button
      aria-label={formatMessage(messages.servers.sortBy, { column: label })}
      className="-ml-3"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="sm"
      variant="ghost"
    >
      {label}
      <ArrowUpDown data-icon="inline-end" />
    </Button>
  );
}

function useTableMotion(search: string) {
  const reducedMotion = useReducedMotion();
  const [animateUpdates, setAnimateUpdates] = useState(true);
  const animateLayout = animateUpdates && !reducedMotion && !search;
  const layout = animateLayout ? ("position" as const) : false;
  const layoutTransition = animateLayout ? rowTransition : { duration: 0 };
  const entryTransition = animateUpdates
    ? { ...rowTransition, duration: reducedMotion ? 0.1 : 0.15 }
    : { duration: 0 };
  return {
    animateUpdates,
    setAnimateUpdates,
    layout,
    layoutTransition,
    entryTransition,
  };
}

export function ServerInventoryTable({
  entries,
  isAdmin,
  onEdit,
  onDelete,
  query,
  onQueryChange,
  totalElements,
  totalHosts,
  totalPages,
  accessTypes,
  databaseEngines,
  loading,
}: {
  entries: ServerEntry[];
  query: ServerInventoryQuery;
  onQueryChange: (query: ServerInventoryQuery) => void;
  totalElements: number;
  totalHosts: number;
  totalPages: number;
  accessTypes: string[];
  databaseEngines: string[];
  loading: boolean;
  isAdmin: boolean;
  onEdit: (entry: ServerEntry) => void;
  onDelete: (entry: ServerEntry) => void;
}) {
  const { messages } = useI18n();
  const {
    animateUpdates,
    setAnimateUpdates,
    layout,
    layoutTransition,
    entryTransition,
  } = useTableMotion(query.search);
  const copy = messages.servers;
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMounted, setFullscreenMounted] = useState(false);
  const tablePanelRef = useRef<HTMLDivElement>(null);
  const [fullscreenOrigin, setFullscreenOrigin] = useState("none");
  const changeFullscreen = (open: boolean) => {
    if (open) {
      const bounds = tablePanelRef.current?.getBoundingClientRect();
      if (bounds) {
        setFullscreenOrigin(
          `translate(${bounds.left}px, ${bounds.top}px) scale(${bounds.width / window.innerWidth}, ${bounds.height / window.innerHeight})`
        );
      }
      setFullscreenMounted(true);
    }
    setFullscreen(open);
  };
  const sorting: SortingState = [
    { id: query.sortBy, desc: query.direction === "desc" },
  ];
  const columnFilters: ColumnFiltersState = [
    ...(query.accessType
      ? [{ id: "accessType", value: query.accessType }]
      : []),
    ...(query.databaseEngine
      ? [{ id: "databaseEngine", value: query.databaseEngine }]
      : []),
  ];
  const search = query.search;
  const setSearch = (value: string) =>
    onQueryChange({ ...query, search: value, page: 0 });
  const setColumnFilters = (filters: ColumnFiltersState) =>
    onQueryChange({
      ...query,
      page: 0,
      accessType: String(
        filters.find((filter) => filter.id === "accessType")?.value ?? ""
      ),
      databaseEngine: String(
        filters.find((filter) => filter.id === "databaseEngine")?.value ?? ""
      ),
    });
  const pagination = { pageIndex: query.page, pageSize: query.size };
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      databaseEngine: false,
    });
  const [collapsedHosts, setCollapsedHosts] = useState<Set<string>>(new Set());
  const [animatedHost, setAnimatedHost] = useState<string | null>(null);
  const toggleHost = (host: string, animate = true) => {
    setAnimatedHost(animate ? host : null);
    setCollapsedHosts((current) => {
      const next = new Set(current);
      if (next.has(host)) {
        next.delete(host);
      } else {
        next.add(host);
      }
      return next;
    });
  };
  const [detailsEntry, setDetailsEntry] = useState<ServerEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsMounted, setDetailsMounted] = useState(false);
  const drawerOpenRef = useRef(false);
  const pendingDrawerAction = useRef<(() => void) | null>(null);
  const openDetails = (entry: ServerEntry) => {
    pendingDrawerAction.current = null;
    setDetailsEntry(entry);
    setDetailsMounted(true);
    drawerOpenRef.current = true;
    setDetailsOpen(true);
  };
  useEffect(() => {
    if (!detailsMounted) {
      const action = pendingDrawerAction.current;
      pendingDrawerAction.current = null;
      action?.();
    }
  }, [detailsMounted]);
  const [revealAll, setRevealAll] = useState(false);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [revealFailed, setRevealFailed] = useState(false);
  const [revealPending, setRevealPending] = useState(false);
  useEffect(() => {
    setPasswords({});
    setRevealFailed(false);
    setRevealPending(false);
    if (!(revealAll && isAdmin) || loading) {
      return;
    }
    let active = true;
    setRevealPending(true);
    const hide = () => setRevealAll(false);
    const timer = window.setTimeout(hide, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hide();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    Promise.allSettled(
      entries
        .filter((entry) => entry.hasPassword)
        .map(async (entry) => {
          const password = await revealServerPassword(entry.id);
          if (active) {
            setPasswords((current) => ({ ...current, [entry.id]: password }));
          }
        })
    ).then((results) => {
      if (active) {
        setRevealPending(false);
        setRevealFailed(results.some((result) => result.status === "rejected"));
      }
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [entries, isAdmin, revealAll, loading]);
  const types = accessTypes;
  const engines = databaseEngines;
  const copyValue = async (value: string) => {
    try {
      if (!(await copyToClipboard(value))) {
        throw new Error(copy.copyFailed);
      }
      toast.success(copy.copied);
    } catch {
      toast.error(copy.copyFailed);
    }
  };
  const columns: ColumnDef<typeof serverTableFeatures, ServerEntry>[] = [
    {
      accessorKey: "name",
      size: 288,
      enableHiding: false,
      header: ({ column }) => <SortHeader column={column} label={copy.name} />,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium" title={row.original.name}>
            {row.original.name}
          </span>
          {row.original.accessType.toUpperCase() === "WEB" &&
            row.original.url &&
            isWebUrl(row.original.url) && (
              <ServerWebLink name={row.original.name} url={row.original.url} />
            )}
        </div>
      ),
    },
    {
      accessorKey: "accessType",
      size: 144,
      header: ({ column }) => (
        <SortHeader column={column} label={copy.accessType} />
      ),
      filterFn: "equalsString",
      cell: ({ row }) => (
        <ServerAccessIcon
          accessType={row.original.accessType}
          databaseEngine={row.original.databaseEngine}
        />
      ),
    },
    {
      accessorKey: "host",
      size: 144,
      header: ({ column }) => (
        <SortHeader column={column} label={copy.hostPort} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap font-mono text-xs">
            {row.original.port === null ? copy.notSet : `:${row.original.port}`}
          </span>
          <Button
            aria-label={formatMessage(copy.copyHost, {
              name: row.original.name,
            })}
            onClick={() => copyValue(formatServerHost(row.original))}
            size="icon-sm"
            title={copy.host}
            variant="ghost"
          >
            <CopyIcon />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "username",
      size: 192,
      header: copy.username,
      cell: ({ row }) =>
        row.original.username ? (
          <div className="flex items-center gap-1">
            <span
              className="min-w-0 truncate font-mono text-xs"
              title={row.original.username}
            >
              {row.original.username}
            </span>
            <Button
              aria-label={formatMessage(copy.copyUsername, {
                name: row.original.name,
              })}
              onClick={() => copyValue(row.original.username ?? "")}
              size="icon-sm"
              variant="ghost"
            >
              <CopyIcon />
            </Button>
          </div>
        ) : (
          copy.notSet
        ),
    },
    {
      id: "password",
      size: 192,
      header: copy.password,
    },
    {
      accessorKey: "databaseEngine",
      enableHiding: false,
      header: copy.databaseEngine,
      filterFn: "equalsString",
      cell: ({ row }) =>
        row.original.databaseEngine ? (
          <ServerAccessIcon
            accessType="DATABASE"
            databaseEngine={row.original.databaseEngine}
            engineOnly
          />
        ) : (
          <span className="text-muted-foreground">{copy.notSet}</span>
        ),
    },
  ];
  const table = useTable({
    features: serverTableFeatures,
    columns,
    data: entries,
    getRowId: (entry) => entry.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    onPaginationChange: (update) => {
      const next = functionalUpdate(update, pagination);
      onQueryChange({
        ...query,
        page: next.pageSize === query.size ? next.pageIndex : 0,
        size: next.pageSize,
      });
    },
    onColumnFiltersChange: (update) =>
      setColumnFilters(functionalUpdate(update, columnFilters)),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    onSortingChange: (update) => {
      const next = functionalUpdate(update, sorting)[0];
      onQueryChange({
        ...query,
        page: 0,
        sortBy: next?.id ?? "name",
        direction: next?.desc ? "desc" : "asc",
      });
    },
    state: {
      columnFilters,
      columnVisibility,
      globalFilter: search,
      sorting,
      pagination,
    },
  });
  const labels = new Map(
    Object.entries({
      accessType: copy.accessType,
      databaseEngine: copy.databaseEngine,
      host: copy.host,
      name: copy.name,
      notes: copy.notes,
      password: copy.password,
      username: copy.username,
    })
  );
  const hostGroups = new Map<
    string,
    ReturnType<typeof table.getRowModel>["rows"]
  >();
  for (const row of table.getRowModel().rows) {
    const group = hostGroups.get(row.original.host) ?? [];
    group.push(row);
    hostGroups.set(row.original.host, group);
  }
  const showSkeleton = loading && entries.length === 0;
  const filteredCount = totalElements;
  const page = table.state.pagination.pageIndex + 1;
  const pages = Math.max(1, table.getPageCount());

  const tableStyle: InventoryStyle = {
    "--table-min-width": `${table.getTotalSize()}px`,
  };
  const fullscreenStyle: InventoryStyle = {
    "--fullscreen-origin": fullscreenOrigin,
  };

  const renderTableRows = () => {
    if (showSkeleton) {
      return (
        <ServerTableLoadingRows
          columnIds={table.getVisibleLeafColumns().map((column) => column.id)}
        />
      );
    }
    return table.getRowModel().rows.length ? (
      [...hostGroups].flatMap(([host, rows]) => [
        <AnimatedTableRow
          animate={{ opacity: 1 }}
          aria-label={formatMessage(copy.hostGroup, { host })}
          className="cursor-pointer bg-muted hover:bg-muted"
          initial={false}
          key={`host:${host}`}
          layout={layout}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest("button")
            ) {
              return;
            }
            toggleHost(host);
          }}
          transition={layoutTransition}
        >
          <TableCell
            colSpan={table.getVisibleLeafColumns().length}
            variant="host-group"
          >
            <div className="flex items-center gap-2">
              <Button
                aria-expanded={!collapsedHosts.has(host)}
                aria-label={formatMessage(
                  collapsedHosts.has(host)
                    ? copy.expandHost
                    : copy.collapseHost,
                  { host }
                )}
                onClick={(event) => toggleHost(host, event.detail > 0)}
                size="sm"
                variant="ghost"
              >
                <ChevronDown
                  className={cn(
                    animatedHost === host &&
                      "transition-transform duration-150 ease-out motion-reduce:transition-none",
                    collapsedHosts.has(host) ? "-rotate-90" : "rotate-0"
                  )}
                  data-icon="inline-start"
                />
                <Server
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {copy.host}
                </span>
                <span className="font-medium font-mono text-sm">{host}</span>
              </Button>
              <Button
                aria-label={formatMessage(copy.copyHostGroup, {
                  host,
                })}
                onClick={() => copyValue(host)}
                size="icon-sm"
                variant="ghost"
              >
                <CopyIcon />
              </Button>
            </div>
          </TableCell>
        </AnimatedTableRow>,
        ...(collapsedHosts.has(host) ? [] : rows).map((row) => (
          <ContextMenu key={row.id}>
            <ContextMenuTrigger asChild>
              <AnimatedTableRow
                animate={{ opacity: 1 }}
                aria-label={formatMessage(copy.viewDetailsFor, {
                  name: row.original.name,
                })}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                initial={animateUpdates ? { opacity: 0.65 } : false}
                layout={layout}
                onClick={(event) => {
                  if (
                    event.target instanceof Element &&
                    event.target.closest(
                      "button, a, input, [role='menuitem'], [role='switch'], [data-slot='hover-card-content']"
                    )
                  ) {
                    return;
                  }
                  openDetails(row.original);
                }}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    openDetails(row.original);
                  }
                }}
                tabIndex={0}
                transition={entryTransition}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    size={cell.column.id === "name" ? "indented" : "default"}
                    variant="ellipsis"
                  >
                    {cell.column.id === "password" ? (
                      <ServerPasswordCell
                        bulkPassword={passwords[row.original.id]}
                        entry={row.original}
                        isAdmin={isAdmin}
                        loading={loading}
                        revealAll={revealAll}
                      />
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </AnimatedTableRow>
            </ContextMenuTrigger>
            <ContextMenuContent variant="macos">
              <ContextMenuGroup>
                <ContextMenuItem onClick={() => openDetails(row.original)}>
                  {copy.viewDetails}
                </ContextMenuItem>
              </ContextMenuGroup>
              {isAdmin && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <ContextMenuItem
                      disabled={loading}
                      onClick={() => onEdit(row.original)}
                    >
                      {copy.edit}
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={loading}
                      onClick={() => onDelete(row.original)}
                      variant="destructive"
                    >
                      {copy.delete}
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        )),
      ])
    ) : (
      <TableRow>
        <TableCell colSpan={table.getVisibleLeafColumns().length}>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{copy.noMatches}</EmptyTitle>
              <EmptyDescription>{copy.noMatchesDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>
    );
  };

  const content = (
    <div
      className="server-inventory-table flex min-w-0 flex-col overflow-hidden rounded-md border bg-background lg:min-h-0 lg:flex-1"
      data-fullscreen={fullscreenMounted}
      data-motion={animateUpdates}
      onKeyDownCapture={() => setAnimateUpdates(false)}
      onPointerDownCapture={() => setAnimateUpdates(true)}
      ref={tablePanelRef}
    >
      <Drawer
        direction="right"
        onAnimationEnd={(open) => {
          if (!(open || drawerOpenRef.current)) {
            setDetailsMounted(false);
          }
        }}
        onOpenChange={(open) => {
          drawerOpenRef.current = open;
          setDetailsOpen(open);
        }}
        open={detailsOpen}
        shouldScaleBackground={false}
      >
        {detailsMounted && (
          <DrawerContent
            className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
            showSwipeHandle={false}
          >
            <DrawerHeader
              className="relative mb-4 shrink-0"
              size="lg"
              variant="left"
            >
              <DrawerClose asChild>
                <Button
                  aria-label={messages.common.close}
                  className="absolute top-4 right-4"
                  size="icon-lg"
                  variant="secondary"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={18}
                    strokeWidth={1.8}
                  />
                </Button>
              </DrawerClose>
              <div className="pr-12">
                <DrawerTitle className="break-words" size="xl">
                  {detailsEntry?.name}
                </DrawerTitle>
              </div>
              <DrawerDescription>{copy.detailsTitle}</DrawerDescription>
              {detailsEntry && (
                <div className="mt-3 flex items-center gap-2 text-muted-foreground text-sm">
                  <ServerAccessIcon
                    accessType={detailsEntry.accessType}
                    databaseEngine={detailsEntry.databaseEngine}
                    decorative
                  />
                  <span className="min-w-0 break-words">
                    {[detailsEntry.accessType, detailsEntry.databaseEngine]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              )}
            </DrawerHeader>
            <ScrollArea className="min-h-0 flex-1" contentSize="drawer">
              {detailsEntry && (
                <ServerEntryDetails
                  entry={detailsEntry}
                  isAdmin={isAdmin}
                  open={detailsOpen}
                />
              )}
            </ScrollArea>
            <DrawerFooter className="shrink-0" size="lg" variant="bordered">
              {isAdmin && detailsEntry && (
                <div className="flex flex-wrap gap-2">
                  <DrawerClose asChild>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        pendingDrawerAction.current = () =>
                          onEdit(detailsEntry);
                      }}
                      variant="outline"
                    >
                      <Pen data-icon="inline-start" />
                      {copy.edit}
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        pendingDrawerAction.current = () =>
                          onDelete(detailsEntry);
                      }}
                      variant="destructive"
                    >
                      <Trash2 data-icon="inline-start" />
                      {copy.delete}
                    </Button>
                  </DrawerClose>
                </div>
              )}
              <DrawerClose asChild>
                <Button variant="outline">{messages.common.close}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        )}
      </Drawer>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-background p-3">
        <InputGroup className="w-full min-w-0 sm:w-64 sm:shrink-0 xl:w-72">
          <InputGroupInput
            aria-label={copy.search}
            onChange={(event) => {
              setAnimateUpdates(true);
              table.setGlobalFilter(event.target.value);
            }}
            placeholder={copy.searchCompact}
            value={search}
          />
          <InputGroupAddon>
            <HugeiconsIcon
              aria-hidden="true"
              icon={SearchIcon}
              strokeWidth={2}
            />
          </InputGroupAddon>
        </InputGroup>
        <ServerInventoryFilter
          allLabel={copy.allTypesCompact}
          emptyLabel={copy.noMatches}
          label={copy.filterType}
          onChange={(value) =>
            onQueryChange({
              ...query,
              accessType: value,
              databaseEngine:
                value.toUpperCase() === "DATABASE" ? query.databaseEngine : "",
              page: 0,
            })
          }
          options={types}
          value={query.accessType}
        />
        {query.accessType.toUpperCase() === "DATABASE" && (
          <ServerInventoryFilter
            allLabel={copy.allEnginesCompact}
            emptyLabel={copy.noMatches}
            engine
            label={copy.filterEngine}
            onChange={(value) =>
              table
                .getColumn("databaseEngine")
                ?.setFilterValue(value || undefined)
            }
            options={engines}
            value={query.databaseEngine}
          />
        )}
        {(search || columnFilters.length > 0) && (
          <Button
            aria-label={copy.clearFilters}
            onClick={() => {
              onQueryChange({
                ...query,
                search: "",
                accessType: "",
                databaseEngine: "",
                page: 0,
              });
            }}
            size="sm"
            variant="ghost"
          >
            <ListFilter data-icon="inline-start" />
            {copy.clearFiltersCompact}
          </Button>
        )}
        <div className="flex w-full flex-wrap items-center gap-3 border-t pt-2 sm:ml-auto sm:w-auto sm:border-t-0 sm:pt-0">
          {isAdmin && (
            <div className="flex min-h-9 items-center gap-2">
              <Switch
                aria-label={copy.revealAll}
                checked={revealAll}
                id="reveal-all-passwords"
                onCheckedChange={setRevealAll}
              />
              <Label className="cursor-pointer" htmlFor="reveal-all-passwords">
                <span aria-hidden="true">{copy.revealAllCompact}</span>
                <span className="sr-only">{copy.revealAll}</span>
              </Label>
              {revealPending && (
                <Spinner aria-label={copy.revealingPasswords} />
              )}
            </div>
          )}
          <ServerInventorySpreadsheetExport
            entries={entries}
            isAdmin={isAdmin}
            loading={loading}
            query={query}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto" variant="ghost">
                <SlidersHorizontal data-icon="inline-start" />
                {messages.common.columns}
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      key={column.id}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(!!checked)
                      }
                    >
                      {labels.get(column.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen}
            aria-pressed={fullscreen}
            onClick={() => changeFullscreen(!fullscreen)}
            size="icon"
            title={fullscreen ? copy.exitFullscreen : copy.fullscreen}
            variant="ghost"
          >
            <HugeiconsIcon
              icon={fullscreen ? MinimizeScreenIcon : FullScreenIcon}
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>
      {revealFailed && (
        <Alert className="m-3 w-auto shrink-0" variant="destructive">
          <AlertDescription>{copy.revealAllError}</AlertDescription>
        </Alert>
      )}
      <ScrollArea
        className="min-w-0 overflow-hidden lg:min-h-0 lg:flex-1 [&_[data-slot=table-container]]:overflow-visible"
        contentClassName="w-full"
        contentSize="table"
        variant="fit"
      >
        <Table
          aria-busy={loading}
          aria-label={copy.title}
          className="min-w-(--table-min-width) table-fixed"
          style={tableStyle}
        >
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => {
              const style: InventoryStyle = {
                "--column-width": `${(column.getSize() / table.getTotalSize()) * 100}%`,
              };
              return (
                <col
                  className="w-(--column-width)"
                  key={column.id}
                  style={style}
                />
              );
            })}
          </colgroup>
          <TableHeader className="lg:sticky lg:top-0 lg:z-10" variant="sticky">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    aria-sort={getAriaSort(header.column.getIsSorted())}
                    key={header.id}
                    size={header.column.id === "name" ? "indented" : "default"}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-3 py-2">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {showSkeleton
            ? messages.common.loading
            : formatMessage(copy.groupedEntryCount, {
                count: filteredCount,
                hosts: totalHosts,
              })}
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select
            disabled={showSkeleton}
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={String(table.state.pagination.pageSize)}
          >
            <SelectTrigger aria-label={copy.hostsPerPage}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[10, 25, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {formatMessage(copy.hostsCount, { count: size })}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm">
            {formatMessage(copy.pageCount, { page, pages })}
          </span>
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            {messages.common.previous}
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            {messages.common.next}
          </Button>
        </div>
      </div>
    </div>
  );
  return (
    <Dialog
      onOpenChange={changeFullscreen}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setFullscreenMounted(false);
        }
      }}
      open={fullscreen}
    >
      {fullscreenMounted ? (
        <DialogContent
          showCloseButton={false}
          style={fullscreenStyle}
          variant="fullscreen"
        >
          <DialogTitle className="sr-only">{copy.title}</DialogTitle>
          {content}
        </DialogContent>
      ) : (
        content
      )}
    </Dialog>
  );
}
