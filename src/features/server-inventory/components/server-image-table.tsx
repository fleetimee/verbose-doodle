import { ArrowUpDown, ChevronDown } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const IMAGE_SIZE = /^([\d.]+)\s*([kmgtpe]?)(i?)b$/i;

export function imageSizeBytes(size: string): number {
  const match = size.match(IMAGE_SIZE);
  if (!match) {
    return 0;
  }
  const power = " kmgtpe".indexOf((match[2] ?? "").toLowerCase() || " ");
  return Number(match[1]) * (match[3] ? 1024 : 1000) ** power;
}

export function ImageSortHead({
  label,
  active,
  descending,
  onSort,
}: {
  label: string;
  active: boolean;
  descending: boolean;
  onSort: () => void;
}) {
  const { messages } = useI18n();
  const direction = descending ? "descending" : "ascending";
  return (
    <TableHead aria-sort={active ? direction : "none"}>
      <Button
        aria-label={formatMessage(messages.servers.sortBy, { column: label })}
        onClick={onSort}
        size="xs"
        variant={active ? "ghost" : "ghost-muted"}
      >
        <span>{label}</span>
        {active ? (
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-200",
              !descending && "rotate-180"
            )}
            data-icon="inline-end"
          />
        ) : (
          <ArrowUpDown
            className="size-3 opacity-40 transition-opacity"
            data-icon="inline-end"
          />
        )}
      </Button>
    </TableHead>
  );
}
