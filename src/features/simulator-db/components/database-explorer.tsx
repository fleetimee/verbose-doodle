import { GridTableIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Database, Eye, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSchemaObjects } from "@/features/simulator-db/api";
import { DatabaseTableNode } from "@/features/simulator-db/components/database-table-node";
import { DatabaseTreeBranch } from "@/features/simulator-db/components/database-tree";
import { SchemaDefinitionDialog } from "@/features/simulator-db/components/schema-definition-dialog";
import {
  extractErrorMessage,
  type SchemaObject,
  type TableMetadata,
} from "@/features/simulator-db/types";
import { cn } from "@/lib/utils";

type DatabaseExplorerProps = {
  readonly tablesError: string | null;
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
  tablesError,
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
  const [inspectedObject, setInspectedObject] = useState<SchemaObject | null>(
    null
  );
  const queryClient = useQueryClient();
  const schema = useQuery({
    queryKey: ["simulator-db-schema", "objects"],
    queryFn: fetchSchemaObjects,
    staleTime: 30_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const refresh = () => {
    onRefresh();
    queryClient
      .invalidateQueries({ queryKey: ["simulator-db-schema"] })
      .catch(() => undefined);
  };
  const term = search.trim().toLowerCase();
  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(term)
  );
  const views = schema.data?.filter(
    (object) =>
      object.type === "view" && object.name.toLowerCase().includes(term)
  );
  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-1 border-b px-2 py-1">
        <div className="flex min-w-0 items-center justify-between gap-1.5">
          <span className="truncate font-medium text-xs">{m.explorer}</span>
          <Button
            aria-label={m.refresh}
            disabled={isLoading || schema.isFetching}
            onClick={refresh}
            size="icon-xs"
            title={m.refresh}
            variant="ghost-muted"
          >
            <RefreshCw
              className={cn((isLoading || schema.isFetching) && "animate-spin")}
            />
          </Button>
        </div>
        <Input
          aria-label={m.filterSchema}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={m.filterSchema}
          size="toolbar"
          value={search}
          variant="search-field"
        />
      </div>
      <ScrollArea className="min-h-0 min-w-0 flex-1" variant="fit">
        <div className="p-1">
          <DatabaseTreeBranch
            defaultOpen
            icon={<Database />}
            label="dbIsoBillerSim.db"
          >
            <DatabaseTreeBranch
              defaultOpen
              icon={<HugeiconsIcon icon={GridTableIcon} />}
              label={m.tables}
            >
              {isLoading && tables.length === 0 && (
                <div
                  aria-label={m.loading}
                  className="flex flex-col gap-2 p-2"
                  role="status"
                >
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton
                      className="h-3 w-3/4"
                      key={index}
                      variant="table"
                    />
                  ))}
                </div>
              )}
              {tablesError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {m.tablesLoadError}: {tablesError}
                    <Button
                      disabled={isLoading}
                      onClick={refresh}
                      size="xs"
                      variant="ghost"
                    >
                      {m.retryLoad}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {!(isLoading || tablesError) && filteredTables.length === 0 && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {tables.length === 0 ? m.noTables : m.noMatches}
                </p>
              )}
              {filteredTables.map((table) => (
                <DatabaseTableNode
                  isLoading={isLoading}
                  isSelected={selectedTable === table.name}
                  key={table.name}
                  onInspect={setInspectedObject}
                  onOpenTable={onOpenTable}
                  onRefresh={refresh}
                  onSelectTable={onSelectTable}
                  schemaFailed={schema.isError}
                  schemaObjects={schema.data}
                  table={table}
                />
              ))}
            </DatabaseTreeBranch>
            <DatabaseTreeBranch
              defaultOpen={Boolean(term)}
              icon={<Eye />}
              label={m.views}
            >
              {schema.isPending && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {m.loading}
                </p>
              )}
              {schema.isError && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {m.unavailable}
                </p>
              )}
              {views?.length === 0 && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {m.noObjects}
                </p>
              )}
              {views?.map((view) => (
                <Button
                  className="w-full justify-start"
                  key={view.name}
                  onClick={() => setInspectedObject(view)}
                  size="xs"
                  title={view.name}
                  variant="ghost-muted"
                >
                  <Eye />
                  <span className="truncate">{view.name}</span>
                </Button>
              ))}
            </DatabaseTreeBranch>
          </DatabaseTreeBranch>
          {schema.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {m.schemaError}: {extractErrorMessage(schema.error)}
                <Button
                  onClick={() => schema.refetch()}
                  size="xs"
                  variant="ghost"
                >
                  {m.retrySchema}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <SchemaDefinitionDialog
        object={inspectedObject}
        onClose={() => setInspectedObject(null)}
      />
    </div>
  );
}
