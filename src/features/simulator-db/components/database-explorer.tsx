import { useMemo, useState } from "react";
import { Database, RefreshCw, Table } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TableMetadata } from "@/features/simulator-db/types";
import { cn } from "@/lib/utils";

type DatabaseExplorerProps = {
  readonly isLoading: boolean;
  readonly onRefresh: () => void;
  readonly onSelectTable: (tableName: string) => void;
  readonly selectedTable: string | null;
  readonly tables: readonly TableMetadata[];
};

export function DatabaseExplorer({
  isLoading,
  onRefresh,
  onSelectTable,
  selectedTable,
  tables,
}: DatabaseExplorerProps) {
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    if (!search.trim()) {
      return tables;
    }
    const term = search.toLowerCase();
    return tables.filter((t) => t.name.toLowerCase().includes(term));
  }, [tables, search]);

  return (
    <div className="flex h-full flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Explorer Header */}
      <div className="flex flex-col gap-2.5 border-b p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Database className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-semibold text-xs tracking-tight">
                <span className="truncate">dbIsoBillerSim.db</span>
                <span className="size-1.5 shrink-0 rounded-full bg-success ring-2 ring-success/20" />
              </div>
              <p className="truncate font-mono text-muted-foreground text-xs">
                192.168.4.45 (SMB)
              </p>
            </div>
          </div>
          <Button
            className="size-7 shrink-0"
            disabled={isLoading}
            onClick={onRefresh}
            size="icon"
            title="Refresh database schema"
            variant="ghost-muted"
          >
            <RefreshCw
              className={cn("size-3.5", isLoading && "animate-spin")}
            />
          </Button>
        </div>

        {/* Table Search Filter */}
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tables..."
          size="xs"
          value={search}
          variant="search-field"
        />
      </div>

      {/* Explorer Table Tree / List */}
      <div className="flex items-center justify-between px-3 py-1.5 font-medium text-muted-foreground text-xs">
        <span>Tables ({filteredTables.length})</span>
        <span className="text-xs">SQLite 3</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {filteredTables.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-xs">
              {tables.length === 0 ? "No tables found" : "No matching tables"}
            </div>
          ) : (
            filteredTables.map((table) => {
              const isSelected = selectedTable === table.name;
              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                    isSelected
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  key={table.name}
                  onClick={() => onSelectTable(table.name)}
                  type="button"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Table
                      className={cn(
                        "size-3.5 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="truncate font-mono">{table.name}</span>
                  </div>
                  <Badge
                    className="ml-1.5 shrink-0"
                    radius="rounded"
                    size="xs"
                    variant={isSelected ? "secondary" : "outline"}
                  >
                    <span className="tabular-nums">
                      {table.rowCount.toLocaleString()}
                    </span>
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
