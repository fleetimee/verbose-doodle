import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type CSSProperties, useRef, useState } from "react";
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
import { TableHead } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";

export function useDatabaseColumns(
  defaultWidths: Readonly<Record<string, number>> = {}
) {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const resize = (name: string, width: number) =>
    setWidths((previous) => ({
      ...previous,
      [name]: Math.max(64, Math.min(1200, Math.round(width))),
    }));
  return {
    width: (name: string) => widths[name] ?? defaultWidths[name] ?? 160,
    resize,
    reset: () => setWidths({}),
  };
}

export function fitDatabaseColumn(name: string, values: readonly unknown[]) {
  const lines = [
    name,
    ...values.map((value) => String(value ?? "NULL")),
  ].flatMap((value) => value.split("\n"));
  return Math.min(
    1200,
    Math.max(80, ...lines.map((line) => line.length * 7 + 24))
  );
}

type DatabaseColumnHeaderProps = {
  readonly name: string;
  readonly width: number;
  readonly fitWidth: number;
  readonly onResize: (width: number) => void;
  readonly onSort?: () => void;
  readonly sortDirection?: "asc" | "desc";
  readonly type?: string;
  readonly tableName?: string;
  readonly primaryKey?: boolean;
};

export function DatabaseColumnHeader({
  name,
  width,
  fitWidth,
  onResize,
  onSort,
  sortDirection,
  type,
  tableName,
  primaryKey,
}: DatabaseColumnHeaderProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const drag = useRef<{ x: number; width: number } | null>(null);
  const columnStyle: CSSProperties & { "--database-column-width": string } = {
    "--database-column-width": `${width}px`,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableHead
          aria-sort={
            sortDirection &&
            ({ asc: "ascending", desc: "descending" } as const)[sortDirection]
          }
          className="relative w-(--database-column-width)"
          style={columnStyle}
          tabIndex={0}
        >
          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild>
              <Button
                className="w-full justify-start overflow-hidden"
                onClick={onSort}
                size="xs"
                variant="ghost"
              >
                <span className="truncate font-mono">{name}</span>
                {sortDirection && (
                  <HugeiconsIcon
                    icon={
                      sortDirection === "asc" ? ArrowUp01Icon : ArrowDown01Icon
                    }
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent align="start" side="bottom">
              <div className="flex max-w-80 flex-col gap-1">
                <span className="break-all font-mono">{name}</span>
                {type && <span>{type}</span>}
                {tableName && (
                  <span className="break-all font-mono">{tableName}</span>
                )}
                {primaryKey && <span>PRIMARY KEY</span>}
              </div>
            </TooltipContent>
          </Tooltip>
          <Button
            aria-label={`${m.resizeColumn}: ${name}`}
            aria-orientation="vertical"
            aria-valuemax={1200}
            aria-valuemin={64}
            aria-valuenow={width}
            className="absolute inset-y-0 right-0 cursor-col-resize touch-none"
            onDoubleClick={() => onResize(fitWidth)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                onResize(width + (event.key === "ArrowRight" ? 16 : -16));
              }
              if (event.key === "Home") {
                event.preventDefault();
                onResize(fitWidth);
              }
            }}
            onLostPointerCapture={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return;
              }
              event.preventDefault();
              drag.current = { x: event.clientX, width };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (drag.current) {
                onResize(drag.current.width + event.clientX - drag.current.x);
              }
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            role="separator"
            size="column-resize"
            title={m.resizeHint}
            variant="ghost"
          />
        </TableHead>
      </ContextMenuTrigger>
      <ContextMenuContent size="compact" variant="macos">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onResize(fitWidth)} size="compact">
            {m.fitColumn}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onResize(200)} size="compact">
            {m.resetWidth}
          </ContextMenuItem>
          {onSort && (
            <ContextMenuItem onClick={onSort} size="compact">
              {m.sortColumn}
            </ContextMenuItem>
          )}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => copyDatabaseValue(name)}
            size="compact"
          >
            {m.copyName}
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
