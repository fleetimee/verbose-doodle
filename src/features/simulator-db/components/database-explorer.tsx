import { useMemo, useState } from "react";
import { Database, RefreshCw, Table } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TableMetadata } from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";
import { cn } from "@/lib/utils";

type DatabaseExplorerProps = {
  readonly isLoading: boolean;
  readonly onOpenTable: (
    name: string,
    tab: "data" | "console" | "structure"
  ) => void;
  readonly onRefresh: () => void;
  readonly onSelectTable: (tableName: string) => void;
  readonly selectedTable: string | null;
  readonly tables: readonly TableMetadata[];
};

export function DatabaseExplorer({
  isLoading,
  onOpenTable,
  onRefresh,
  onSelectTable,
  selectedTable,
  tables,
}: DatabaseExplorerProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    if (!search.trim()) {
      return tables;
    }
    const term = search.toLowerCase();
    return tables.filter((t) => t.name.toLowerCase().includes(term));
  }, [tables, search]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-1 border-b px-2 py-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <Database className="size-3.5 shrink-0 text-muted-foreground" />
          <span
            className="min-w-0 flex-1 truncate font-medium text-xs"
            title="dbIsoBillerSim.db · SQLite 3 · 192.168.4.45 (SMB)"
          >
            dbIsoBillerSim.db
          </span>
          <Button
            aria-label={m.refresh}
            disabled={isLoading}
            onClick={onRefresh}
            size="icon-xs"
            title={m.refresh}
            variant="ghost-muted"
          >
            <RefreshCw className={cn(isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Table Search Filter */}
        <Input
          aria-label={m.filterTables}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={m.filterTables}
          size="xs"
          value={search}
          variant="search-field"
        />
      </div>

      {/* Explorer Table Tree / List */}
      <div className="flex items-center justify-between px-2 py-1 font-medium text-muted-foreground text-xs">
        <span>
          {m.tables} ({filteredTables.length})
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col p-1">
          {filteredTables.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-xs">
              {tables.length === 0 ? m.noTables : m.noMatches}
            </div>
          ) : (
            filteredTables.map((table) => {
              const isSelected = selectedTable === table.name;
              return (
                <ContextMenu key={table.name}>
                  <ContextMenuTrigger asChild>
                    <Button
                      aria-pressed={isSelected}
                      className="w-full justify-between"
                      onClick={() => onSelectTable(table.name)}
                      size="xs"
                      variant={isSelected ? "secondary" : "ghost-muted"}
                    >
                      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                        <Table
                          className={cn(
                            "size-3.5 shrink-0",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate" title={table.name}>
                          {table.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                        {table.rowCount.toLocaleString()}
                      </span>
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent size="compact" variant="macos">
                    <ContextMenuGroup>
                      <ContextMenuItem
                        onClick={() => onOpenTable(table.name, "data")}
                        size="compact"
                      >
                        {m.openData}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onOpenTable(table.name, "console")}
                        size="compact"
                      >
                        {m.openConsole}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onOpenTable(table.name, "structure")}
                        size="compact"
                      >
                        {m.openStructure}
                      </ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                      <ContextMenuItem
                        onClick={() => copyDatabaseValue(table.name)}
                        size="compact"
                      >
                        {m.copyName}
                      </ContextMenuItem>
                      <ContextMenuItem
                        disabled={isLoading}
                        onClick={onRefresh}
                        size="compact"
                      >
                        {m.refresh}
                      </ContextMenuItem>
                    </ContextMenuGroup>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
