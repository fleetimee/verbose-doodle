import {
  ArrowRight01Icon,
  FlashIcon,
  GridTableIcon,
  ListViewIcon,
  TableColumnsSplitIcon,
  TextIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { KeyRound } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { fetchColumns } from "@/features/simulator-db/api";
import { DatabaseTreeBranch } from "@/features/simulator-db/components/database-tree";
import {
  extractErrorMessage,
  type SchemaObject,
  type TableMetadata,
} from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";
import { cn } from "@/lib/utils";

type DatabaseTableNodeProps = {
  readonly table: TableMetadata;
  readonly isSelected: boolean;
  readonly isLoading: boolean;
  readonly schemaObjects: readonly SchemaObject[] | undefined;
  readonly schemaFailed: boolean;
  readonly onSelectTable: (name: string) => void;
  readonly onOpenTable: (
    name: string,
    tab: "data" | "console" | "structure"
  ) => void;
  readonly onRefresh: () => void;
  readonly onInspect: (object: SchemaObject) => void;
};

export function DatabaseTableNode({
  table,
  isSelected,
  isLoading,
  schemaObjects,
  schemaFailed,
  onSelectTable,
  onOpenTable,
  onRefresh,
  onInspect,
}: DatabaseTableNodeProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const [open, setOpen] = useState(isSelected);
  const columns = useQuery({
    queryKey: ["simulator-db-schema", "columns", table.name],
    queryFn: () => fetchColumns(table.name),
    enabled: open,
    staleTime: 30_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const indexes = schemaObjects?.filter(
    (object) => object.type === "index" && object.tableName === table.name
  );
  const triggers = schemaObjects?.filter(
    (object) => object.type === "trigger" && object.tableName === table.name
  );
  const objectGroups = [
    {
      label: m.indexes,
      objects: indexes,
      icon: <HugeiconsIcon icon={ListViewIcon} />,
    },
    {
      label: m.triggers,
      objects: triggers,
      icon: <HugeiconsIcon icon={FlashIcon} />,
    },
  ];
  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <div className="flex min-w-0 items-center">
        <CollapsibleTrigger
          aria-label={`${m.openStructure}: ${table.name}`}
          render={<Button size="grid-icon" variant="ghost-muted" />}
        >
          <HugeiconsIcon
            className={cn(open && "rotate-90")}
            icon={ArrowRight01Icon}
          />
        </CollapsibleTrigger>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <Button
              aria-pressed={isSelected}
              className="min-w-0 flex-1 justify-start"
              onClick={() => onSelectTable(table.name)}
              size="xs"
              variant={isSelected ? "secondary" : "ghost-muted"}
            >
              <HugeiconsIcon icon={GridTableIcon} />
              <span className="min-w-0 truncate" title={table.name}>
                {table.name}
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
      </div>
      <CollapsibleContent>
        <div className="ml-3 border-border/70 border-l pl-1">
          <DatabaseTreeBranch
            defaultOpen
            icon={<HugeiconsIcon icon={TableColumnsSplitIcon} />}
            label={m.columns}
          >
            {columns.isPending && (
              <p className="px-2 py-1 text-muted-foreground text-xs">
                {m.loading}
              </p>
            )}
            {columns.isError && (
              <div className="flex flex-col px-2 text-xs">
                <span>{extractErrorMessage(columns.error)}</span>
                <Button
                  onClick={() => columns.refetch()}
                  size="xs"
                  variant="ghost"
                >
                  {m.retrySchema}
                </Button>
              </div>
            )}
            {columns.data?.map((column) => (
              <Button
                className="w-full justify-start"
                key={column.cid}
                onClick={() => onOpenTable(table.name, "structure")}
                size="xs"
                title={`${column.name} · ${column.type}`}
                variant="ghost-muted"
              >
                {column.primaryKey ? (
                  <KeyRound />
                ) : (
                  <HugeiconsIcon icon={TextIcon} />
                )}
                <span className="truncate">{column.name}</span>
              </Button>
            ))}
          </DatabaseTreeBranch>
          {objectGroups.map((group) => (
            <DatabaseTreeBranch
              icon={group.icon}
              key={group.label}
              label={group.label}
            >
              {!group.objects && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {schemaFailed ? m.unavailable : m.loading}
                </p>
              )}
              {group.objects?.length === 0 && (
                <p className="px-2 py-1 text-muted-foreground text-xs">
                  {m.noObjects}
                </p>
              )}
              {group.objects?.map((object) => (
                <Button
                  className="w-full justify-start"
                  key={object.name}
                  onClick={() => onInspect(object)}
                  size="xs"
                  title={object.name}
                  variant="ghost-muted"
                >
                  {group.icon}
                  <span className="truncate">{object.name}</span>
                </Button>
              ))}
            </DatabaseTreeBranch>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
