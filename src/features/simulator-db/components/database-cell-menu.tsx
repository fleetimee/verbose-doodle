import type { ReactElement } from "react";
import { useI18n } from "@/components/i18n-provider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { SqlCellValue, SqlRow } from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";

type DatabaseCellMenuProps = {
  readonly children: ReactElement;
  readonly value: SqlCellValue;
  readonly row: SqlRow;
  readonly onInspect: () => void;
  readonly onEdit?: () => void;
  readonly onClone?: () => void;
  readonly onDelete?: () => void;
};

export function DatabaseCellMenu({
  children,
  value,
  row,
  onInspect,
  onEdit,
  onClone,
  onDelete,
}: DatabaseCellMenuProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent size="compact" variant="macos">
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => copyDatabaseValue(String(value ?? "NULL"))}
            size="compact"
          >
            {m.copyCell}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => copyDatabaseValue(JSON.stringify(row, null, 2))}
            size="compact"
          >
            {m.copyRow}
          </ContextMenuItem>
          <ContextMenuItem onClick={onInspect} size="compact">
            {m.inspect}
          </ContextMenuItem>
        </ContextMenuGroup>
        {onEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem onClick={onEdit} size="compact">
                {m.editRow}
              </ContextMenuItem>
              <ContextMenuItem onClick={onClone} size="compact">
                {m.cloneRow}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={onDelete}
                size="compact"
                variant="destructive"
              >
                {m.deleteRow}
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
