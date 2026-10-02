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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronDown,
  CopyIcon,
  Eye,
  MoreHorizontal,
  Pen,
  Server,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuItem,
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
import { isWebUrl } from "@/features/server-inventory/server-form";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";

const databaseEngineLabels: Record<string, string> = {
  ORACLE: "ORA",
  POSTGRESQL: "PG",
  MYSQL: "MYSQL",
  MONGO: "MDB",
  MONGODB: "MDB",
  REDIS: "RDS",
  SQLSERVER: "MSSQL",
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
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="sm"
      variant="ghost"
    >
      {label}
      <ArrowUpDown data-icon="inline-end" />
    </Button>
  );
}

export function ServerInventoryTable({
  entries,
  isAdmin,
  onEdit,
  onDelete,
  onReveal,
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
  onReveal: (entry: ServerEntry) => void;
}) {
  const { locale, messages } = useI18n();
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
    databaseName: false,
    updatedAt: false,
    url: false,
  });
  const [collapsedHosts, setCollapsedHosts] = useState<Set<string>>(new Set());
  const [notesEntry, setNotesEntry] = useState<ServerEntry | null>(null);
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
      enableHiding: false,
      header: ({ column }) => <SortHeader column={column} label={copy.name} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "accessType",
      header: ({ column }) => (
        <SortHeader column={column} label={copy.accessType} />
      ),
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Badge
          title={row.original.databaseEngine ?? undefined}
          variant="outline"
        >
          {row.original.accessType}
          {row.original.accessType === "DATABASE" &&
            row.original.databaseEngine &&
            ` | ${databaseEngineLabels[row.original.databaseEngine.toUpperCase()] ?? row.original.databaseEngine.toUpperCase().slice(0, 3)}`}
        </Badge>
      ),
    },
    {
      accessorKey: "host",
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
      header: copy.username,
      cell: ({ row }) =>
        row.original.username ? (
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs">{row.original.username}</span>
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
      header: copy.password,
      cell: ({ row }) => {
        if (!row.original.hasPassword) {
          return <span className="text-muted-foreground">{copy.notSet}</span>;
        }
        if (isAdmin && revealAll && passwords[row.original.id] !== undefined) {
          return (
            <div className="flex items-center gap-1">
              <span className="whitespace-pre font-mono text-xs">
                {passwords[row.original.id]}
              </span>
              <Button
                aria-label={formatMessage(copy.copyPasswordFor, {
                  name: row.original.name,
                })}
                onClick={() => copyValue(passwords[row.original.id])}
                size="icon-sm"
                variant="ghost"
              >
                <CopyIcon />
              </Button>
            </div>
          );
        }
        return isAdmin ? (
          <Button
            aria-label={formatMessage(copy.revealFor, {
              name: row.original.name,
            })}
            onClick={() => onReveal(row.original)}
            size="sm"
            variant="ghost"
          >
            <span className="font-mono">••••••••</span>
            <Eye data-icon="inline-end" />
          </Button>
        ) : (
          <span className="font-mono">
            <span aria-hidden="true">••••••••</span>
            <span className="sr-only">{copy.passwordStored}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "url",
      header: copy.url,
      cell: ({ row }) =>
        row.original.url && isWebUrl(row.original.url) ? (
          <a
            className="inline-block max-w-64 truncate text-primary underline underline-offset-4"
            href={row.original.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {row.original.url}
          </a>
        ) : (
          copy.notSet
        ),
    },
    {
      accessorKey: "databaseEngine",
      enableHiding: false,
      header: copy.databaseEngine,
      filterFn: "equalsString",
      cell: ({ row }) =>
        row.original.databaseEngine ? (
          <Badge variant="outline">{row.original.databaseEngine}</Badge>
        ) : (
          <span className="text-muted-foreground">{copy.notSet}</span>
        ),
    },
    {
      accessorKey: "databaseName",
      header: copy.databaseName,
      cell: ({ row }) => row.original.databaseName || copy.notSet,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortHeader column={column} label={copy.updated} />
      ),
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleDateString(locale),
    },
    ...(isAdmin
      ? [
          {
            id: "actions",
            enableHiding: false,
            header: () => <span className="sr-only">{copy.actions}</span>,
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={formatMessage(copy.actionsFor, {
                      name: row.original.name,
                    })}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>
                      <Pen />
                      {copy.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(row.original)}
                      variant="destructive"
                    >
                      <Trash2 />
                      {copy.delete}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } satisfies ColumnDef<ServerEntry>,
        ]
      : []),
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
    databaseName: copy.databaseName,
    host: copy.host,
    name: copy.name,
    notes: copy.notes,
    password: copy.password,
    updatedAt: copy.updated,
    url: copy.url,
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
    <div className="flex min-w-0 flex-col gap-4">
      <Drawer
        direction="right"
        onOpenChange={(open) => {
          if (!open) {
            setNotesEntry(null);
          }
        }}
        open={notesEntry !== null}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
          showSwipeHandle={false}
        >
          <DrawerHeader className="shrink-0" size="lg" variant="left">
            <DrawerTitle>{copy.notes}</DrawerTitle>
            <DrawerDescription>{notesEntry?.name}</DrawerDescription>
          </DrawerHeader>
          <div
            className="min-h-0 flex-1 overflow-y-auto px-6 pb-6"
            data-vaul-no-drag
          >
            <p className="whitespace-pre-wrap break-words text-sm">
              {notesEntry?.notes || copy.notSet}
            </p>
          </div>
          <DrawerFooter className="shrink-0" size="lg" variant="bordered">
            <DrawerClose asChild>
              <Button variant="outline">{messages.common.close}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label={copy.search}
          className="min-w-48 flex-1 sm:max-w-sm"
          onChange={(event) => table.setGlobalFilter(event.target.value)}
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
              aria-describedby="reveal-all-description"
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
      {isAdmin && (
        <p
          className="text-muted-foreground text-xs"
          id="reveal-all-description"
        >
          {copy.revealAllDescription}
        </p>
      )}
      {revealFailed && (
        <Alert variant="destructive">
          <AlertDescription>{copy.revealAllError}</AlertDescription>
        </Alert>
      )}
      <div className="min-w-0 overflow-hidden rounded-md border">
        <Table aria-busy={loading} aria-label={copy.title}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    aria-sort={getAriaSort(header.column.getIsSorted())}
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
                <TableRow
                  aria-label={formatMessage(copy.hostGroup, { host })}
                  className="bg-muted hover:bg-muted"
                  key={`host:${host}`}
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
                        onClick={() =>
                          setCollapsedHosts((current) => {
                            const next = new Set(current);
                            if (next.has(host)) {
                              next.delete(host);
                            } else {
                              next.add(host);
                            }
                            return next;
                          })
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {collapsedHosts.has(host) ? (
                          <ChevronDown
                            className="-rotate-90"
                            data-icon="inline-start"
                          />
                        ) : (
                          <ChevronDown data-icon="inline-start" />
                        )}
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
                      <Badge className="ml-auto" variant="outline">
                        {rows.length === 1
                          ? copy.singleAccess
                          : formatMessage(copy.accessCount, {
                              count: rows.length,
                            })}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>,
                ...(collapsedHosts.has(host) ? [] : rows).map((row) => (
                  <TableRow
                    aria-label={formatMessage(copy.viewNotesFor, {
                      name: row.original.name,
                    })}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    key={row.id}
                    onClick={(event) => {
                      if (
                        (event.target as HTMLElement).closest(
                          "button, a, input, [role='menuitem'], [role='switch']"
                        )
                      ) {
                        return;
                      }
                      setNotesEntry(row.original);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        setNotesEntry(row.original);
                      }
                    }}
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={
                          cell.column.id === "name" ? "pl-8" : undefined
                        }
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
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
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {formatMessage(copy.groupedEntryCount, {
            count: filteredCount,
            hosts: totalHosts,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
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
