import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
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

export function compareImages(
  left: Record<string, string>,
  right: Record<string, string>,
  sort: string,
  descending: boolean
): number {
  const comparison =
    sort === "Size"
      ? imageSizeBytes(left.Size ?? "") - imageSizeBytes(right.Size ?? "")
      : (left[sort] ?? "").localeCompare(right[sort] ?? "", undefined, {
          numeric: true,
        });
  return (
    (descending ? -comparison : comparison) ||
    `${left.Repository}:${left.Tag}:${left.ID}`.localeCompare(
      `${right.Repository}:${right.Tag}:${right.ID}`
    )
  );
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

export function ImageTagBadge({ tag }: { tag?: string }) {
  if (!tag || tag === "<none>" || tag === "-") {
    return (
      <span className="select-none font-mono text-muted-foreground/40 text-xs">
        —
      </span>
    );
  }
  return (
    <Badge className="max-w-full" mono radius="rounded" variant="muted">
      <span className="truncate" title={tag}>
        {tag}
      </span>
    </Badge>
  );
}

export function ImageTableShimmer({ active }: { active: boolean }) {
  return (
    <div className="relative h-0.5 w-full overflow-hidden bg-transparent">
      <AnimatePresence>
        {active && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/20"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              animate={{ x: ["-100%", "250%"] }}
              className="h-full w-1/3 rounded-full bg-primary"
              transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ImageTablePagination({
  page,
  pages,
  onPageChange,
}: {
  page: number;
  pages: number;
  onPageChange: (nextPage: number) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.images;
  if (pages <= 1) {
    return null;
  }
  return (
    <div className="mt-auto flex items-center justify-between border-border/40 border-t px-4 py-2.5">
      <span className="text-muted-foreground text-xs tabular-nums">
        {page} / {pages}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="xs"
          variant="outline"
        >
          <ChevronLeft className="size-3" data-icon="inline-start" />
          {copy.previous}
        </Button>
        <Button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          size="xs"
          variant="outline"
        >
          {copy.next}
          <ChevronRight className="size-3" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
