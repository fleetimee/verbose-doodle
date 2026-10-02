import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronDown,
  CopyIcon,
  Pen,
  Server,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
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
import { ServerPasswordCell } from "@/features/server-inventory/components/server-password-cell";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";

const AnimatedTableRow = motion.create(TableRow);
const rowTransition = {
  duration: 0.15,
  ease: [0.23, 1, 0.32, 1] as const,
};

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
  column: Column<ServerEntry>;
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
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
  const columns: ColumnDef<ServerEntry>[] = [
    {
      accessorKey: "name",
      size: 288,
      enableHiding: false,
      header: ({ column }) => <SortHeader column={column} label={copy.name} />,
      cell: ({ row }) => (
        <span className="block truncate font-medium" title={row.original.name}>
          {row.original.name}
        </span>
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
  const table = useReactTable({
    columns,
    data: entries,
    getRowId: (entry) => entry.id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    onPaginationChange: (update) => {
      const next = typeof update === "function" ? update(pagination) : update;
      onQueryChange({
        ...query,
        page: next.pageSize === query.size ? next.pageIndex : 0,
        size: next.pageSize,
      });
    },
    onColumnFiltersChange: (update) =>
      setColumnFilters(
        typeof update === "function" ? update(columnFilters) : update
      ),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    onSortingChange: (update) => {
      const next = (typeof update === "function" ? update(sorting) : update)[0];
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
  const labels: Record<string, string> = {
    accessType: copy.accessType,
    databaseEngine: copy.databaseEngine,
    host: copy.host,
    name: copy.name,
    notes: copy.notes,
    password: copy.password,
    username: copy.username,
  };
  const hostGroups = new Map<
    string,
    ReturnType<typeof table.getRowModel>["rows"]
  >();
  for (const row of table.getRowModel().rows) {
    const group = hostGroups.get(row.original.host) ?? [];
    group.push(row);
    hostGroups.set(row.original.host, group);
  }
  const filteredCount = totalElements;
  const page = table.getState().pagination.pageIndex + 1;
  const pages = Math.max(1, table.getPageCount());

  return (
    <div
      className="server-inventory-table flex min-w-0 flex-col overflow-hidden rounded-md border bg-background lg:min-h-0 lg:flex-1"
      data-motion={animateUpdates}
      onKeyDownCapture={() => setAnimateUpdates(false)}
      onPointerDownCapture={() => setAnimateUpdates(true)}
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
            <DrawerHeader className="shrink-0" size="lg" variant="left">
              <DrawerTitle>{copy.detailsTitle}</DrawerTitle>
              <DrawerDescription>{detailsEntry?.name}</DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="min-h-0 flex-1" contentClassName="px-6 pb-6">
              {detailsEntry && <ServerEntryDetails entry={detailsEntry} />}
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
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-muted/20 p-3">
        <Input
          aria-label={copy.search}
          className="min-w-48 flex-1 sm:max-w-sm"
          onChange={(event) => {
            setAnimateUpdates(true);
            table.setGlobalFilter(event.target.value);
          }}
          placeholder={copy.search}
          value={search}
        />
        <Select
          onValueChange={(value) =>
            table
              .getColumn("accessType")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
          value={String(
            table.getColumn("accessType")?.getFilterValue() ?? "all"
          )}
        >
          <SelectTrigger aria-label={copy.filterType} className="min-w-36">
            <SelectValue>
              {String(
                table.getColumn("accessType")?.getFilterValue() ?? copy.allTypes
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{copy.allTypes}</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            table
              .getColumn("databaseEngine")
              ?.setFilterValue(value === "all" ? undefined : value)
          }
          value={String(
            table.getColumn("databaseEngine")?.getFilterValue() ?? "all"
          )}
        >
          <SelectTrigger aria-label={copy.filterEngine} className="min-w-36">
            <SelectValue>
              {String(
                table.getColumn("databaseEngine")?.getFilterValue() ??
                  copy.allEngines
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{copy.allEngines}</SelectItem>
              {engines.map((engine) => (
                <SelectItem key={engine} value={engine}>
                  {engine}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(search || columnFilters.length > 0) && (
          <Button
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
            {copy.clearFilters}
          </Button>
        )}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Switch
              checked={revealAll}
              id="reveal-all-passwords"
              onCheckedChange={setRevealAll}
            />
            <Label htmlFor="reveal-all-passwords">{copy.revealAll}</Label>
            {revealPending && <Spinner aria-label={copy.revealingPasswords} />}
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="sm:ml-auto" variant="outline">
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
                    {labels[column.id]}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {revealFailed && (
        <Alert className="m-3 w-auto shrink-0" variant="destructive">
          <AlertDescription>{copy.revealAllError}</AlertDescription>
        </Alert>
      )}
      <ScrollArea
        className="min-w-0 overflow-hidden lg:min-h-0 lg:flex-1 [&_[data-slot=table-container]]:overflow-visible"
        contentClassName="w-full pb-2.5"
        variant="fit"
      >
        <Table
          aria-busy={loading}
          aria-label={copy.title}
          className="table-fixed"
          style={{ minWidth: table.getTotalSize() }}
        >
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
              <col
                key={column.id}
                style={{
                  width: `${(column.getSize() / table.getTotalSize()) * 100}%`,
                }}
              />
            ))}
          </colgroup>
          <TableHeader className="bg-background lg:sticky lg:top-0 lg:z-10">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    aria-sort={getAriaSort(header.column.getIsSorted())}
                    className={header.column.id === "name" ? "pl-8" : undefined}
                    key={header.id}
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
          <TableBody>
            {table.getRowModel().rows.length ? (
              [...hostGroups].flatMap(([host, rows]) => [
                <AnimatedTableRow
                  animate={{ opacity: 1 }}
                  aria-label={formatMessage(copy.hostGroup, { host })}
                  className="cursor-pointer bg-muted hover:bg-muted"
                  initial={false}
                  key={`host:${host}`}
                  layout={layout}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) {
                      return;
                    }
                    toggleHost(host);
                  }}
                  transition={layoutTransition}
                >
                  <TableCell
                    className="border-primary/60 border-l-2 py-2"
                    colSpan={table.getVisibleLeafColumns().length}
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
                          className={
                            animatedHost === host
                              ? "transition-transform duration-150 ease-[var(--ease-out,cubic-bezier(0.23,1,0.32,1))] motion-reduce:transition-none"
                              : undefined
                          }
                          data-icon="inline-start"
                          style={{
                            transform: collapsedHosts.has(host)
                              ? "rotate(-90deg)"
                              : "rotate(0deg)",
                          }}
                        />
                        <Server
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                          {copy.host}
                        </span>
                        <span className="font-medium font-mono text-sm">
                          {host}
                        </span>
                      </Button>
                      <Button
                        aria-label={formatMessage(copy.copyHostGroup, { host })}
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
                  <AnimatedTableRow
                    animate={{ opacity: 1 }}
                    aria-label={formatMessage(copy.viewDetailsFor, {
                      name: row.original.name,
                    })}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    initial={animateUpdates ? { opacity: 0.65 } : false}
                    key={row.id}
                    layout={layout}
                    onClick={(event) => {
                      if (
                        (event.target as HTMLElement).closest(
                          "button, a, input, [role='menuitem'], [role='switch']"
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
                        className={
                          cell.column.id === "name"
                            ? "overflow-hidden text-ellipsis pl-8"
                            : "overflow-hidden text-ellipsis"
                        }
                        key={cell.id}
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
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </AnimatedTableRow>
                )),
              ])
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length}>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>{copy.noMatches}</EmptyTitle>
                      <EmptyDescription>
                        {copy.noMatchesDescription}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-3 py-2">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {formatMessage(copy.groupedEntryCount, {
            count: filteredCount,
            hosts: totalHosts,
          })}
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={String(table.getState().pagination.pageSize)}
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
}
