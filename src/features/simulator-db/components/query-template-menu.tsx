import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchColumns } from "@/features/simulator-db/api";
import { buildQueryTemplates } from "@/features/simulator-db/utils/query-templates";

type QueryTemplateMenuProps = {
  readonly selectedTable: string | null;
  readonly onSelect: (sql: string) => void;
  readonly disabled: boolean;
};
export function QueryTemplateMenu({
  selectedTable,
  onSelect,
  disabled,
}: QueryTemplateMenuProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const columns = useQuery({
    queryKey: ["simulator-db-schema", "columns", selectedTable],
    queryFn: () => fetchColumns(selectedTable ?? ""),
    enabled: Boolean(selectedTable),
    staleTime: 60_000,
    gcTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const groups = useMemo(
    () => buildQueryTemplates(selectedTable, columns.data ?? []),
    [selectedTable, columns.data]
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled} size="xs" variant="outline">
          {m.templates}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {groups.map((group) => (
            <DropdownMenuSub key={group.label}>
              <DropdownMenuSubTrigger>{m[group.label]}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  {group.items.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      onClick={() => onSelect(item.sql)}
                    >
                      {m[item.label]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
          {selectedTable && columns.isPending && (
            <DropdownMenuItem disabled>{m.loading}</DropdownMenuItem>
          )}
          {columns.isError && (
            <DropdownMenuItem onClick={() => columns.refetch()}>
              {m.schemaError} · {m.retryLoad}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
