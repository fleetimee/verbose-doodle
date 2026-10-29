import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Braces,
  Check,
  ChevronRight,
  Code2,
  CopyIcon,
  FileText,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type InspectMode = "tree" | "text";

function isExpandable(
  value: unknown
): value is Record<string, unknown> | unknown[] {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Object.keys(value).length > 0;
}

function inlineValuePreview(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return "[object Object]";
  }
  if (typeof value === "object") {
    return "[object Object]";
  }
  return String(value);
}

function collapsedSummary(value: Record<string, unknown> | unknown[]): string {
  if (Array.isArray(value)) {
    const items = value.slice(0, 6).map((item) => inlineValuePreview(item));
    const suffix = value.length > 6 ? ", …" : "";
    return `[ ${items.join(", ")}${suffix} ]`;
  }
  const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
  const pairs = keys.slice(0, 5).map((key) => {
    const child = value[key];
    if (Array.isArray(child)) {
      return `${key}: ${child.map((item) => inlineValuePreview(item)).join(",")}`;
    }
    return `${key}: ${inlineValuePreview(child)}`;
  });
  const suffix = keys.length > 5 ? ", …" : "";
  return `{ ${pairs.join(", ")}${suffix} }`;
}

function formatLeafValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value) || typeof value === "object") {
    return "";
  }
  return String(value);
}

function nodeMatchesQuery(key: string, value: unknown, query: string): boolean {
  if (!query) {
    return true;
  }
  if (key.toLowerCase().includes(query)) {
    return true;
  }
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value !== "object") {
    return String(value).toLowerCase().includes(query);
  }
  if (Array.isArray(value)) {
    return value.some((item, index) =>
      nodeMatchesQuery(String(index), item, query)
    );
  }
  return Object.entries(value).some(([childKey, childValue]) =>
    nodeMatchesQuery(childKey, childValue, query)
  );
}

function collectExpandablePaths(
  value: unknown,
  path: string,
  out: Set<string>
) {
  if (!isExpandable(value)) {
    return;
  }
  out.add(path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectExpandablePaths(item, `${path}.${index}`, out);
    });
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    collectExpandablePaths(child, `${path}.${key}`, out);
  }
}

function InspectTreeNode({
  label,
  value,
  path,
  depth,
  expandedPaths,
  onToggle,
  searchQuery,
}: {
  label: string;
  value: unknown;
  path: string;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  searchQuery: string;
}) {
  if (!nodeMatchesQuery(label, value, searchQuery)) {
    return null;
  }

  const expandable = isExpandable(value);
  const isExpanded = Boolean(searchQuery) || expandedPaths.has(path);
  const indent = depth * 18;

  if (!expandable) {
    const formatted = formatLeafValue(value);
    return (
      <div
        className="flex min-w-0 items-baseline gap-2 rounded-md py-1 pr-3 font-mono text-xs leading-5 transition-colors hover:bg-muted/40"
        style={{ paddingLeft: `${indent + 22}px` }}
      >
        <span className="shrink-0 text-foreground/90">{label}:</span>
        {formatted !== "" && (
          <span className="min-w-0 break-all text-primary dark:text-sky-400">
            {formatted}
          </span>
        )}
      </div>
    );
  }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, value[key]]);

  return (
    <div className="min-w-0">
      <button
        aria-expanded={isExpanded}
        className="group flex w-full min-w-0 items-baseline gap-1.5 rounded-md py-1 pr-3 text-left font-mono text-xs leading-5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring active:bg-muted/70"
        onClick={() => onToggle(path)}
        style={{ paddingLeft: `${indent + 4}px` }}
        type="button"
      >
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-150 ease-out group-hover:text-foreground motion-reduce:transition-none",
            isExpanded && "rotate-90 text-foreground"
          )}
        />
        <span className="shrink-0 font-medium text-foreground">{label}:</span>
        {!isExpanded && (
          <span className="min-w-0 truncate text-primary/80 dark:text-sky-400/85">
            {collapsedSummary(value)}
          </span>
        )}
      </button>
      {isExpanded && (
        <div className="min-w-0">
          {entries.map(([childKey, childValue]) => (
            <InspectTreeNode
              depth={depth + 1}
              expandedPaths={expandedPaths}
              key={childKey}
              label={childKey}
              onToggle={onToggle}
              path={`${path}.${childKey}`}
              searchQuery={searchQuery}
              value={childValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ServerContainerInspect({
  containerId,
  inspect,
  loading,
}: {
  containerId: string;
  inspect?: Record<string, unknown> | null;
  loading: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const [mode, setMode] = useState<InspectMode>("tree");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const rootKey = String(inspect?.Id ?? containerId);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(["root"])
  );

  const normalizedSearch = search.trim().toLowerCase();
  const formattedText = useMemo(
    () => (inspect ? JSON.stringify(inspect, null, 2) : ""),
    [inspect]
  );

  const filteredText = useMemo(() => {
    if (!normalizedSearch) {
      return formattedText;
    }
    return formattedText
      .split("\n")
      .filter((line) => line.toLowerCase().includes(normalizedSearch))
      .join("\n");
  }, [formattedText, normalizedSearch]);

  const allExpanded = expandedPaths.size > 1;

  const handleTogglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (!inspect) {
      return;
    }
    if (allExpanded) {
      setExpandedPaths(new Set(["root"]));
      return;
    }
    const next = new Set<string>();
    collectExpandablePaths(inspect, "root", next);
    setExpandedPaths(next);
  };

  const handleCopy = async () => {
    if (!formattedText) {
      return;
    }
    await navigator.clipboard.writeText(formattedText);
    setCopied(true);
    toast.success(copy.inspectCopied);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const hasMatches =
    !normalizedSearch ||
    (mode === "tree"
      ? nodeMatchesQuery(rootKey, inspect, normalizedSearch)
      : filteredText.length > 0);

  return (
    <Card size="monitor" variant="monitor">
      <CardHeader size="none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle
            className="text-sm tracking-[-0.01em]"
            size="sm"
            variant="inline"
          >
            <Braces
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            {copy.inspectTitle}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <HugeiconsIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground"
                icon={Search01Icon}
                strokeWidth={2}
              />
              <input
                aria-label={copy.inspectSearch}
                className="h-7 w-44 rounded-lg border border-border/60 bg-muted/30 pr-7 pl-8 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background sm:w-52"
                disabled={loading || !inspect}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.inspectSearch}
                type="text"
                value={search}
              />
              {search && (
                <button
                  aria-label={messages.common.clear}
                  className="absolute right-1.5 flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-3"
                    icon={Cancel01Icon}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>
            {mode === "tree" && (
              <Button
                className="h-7 px-2.5 text-xs"
                disabled={loading || !inspect}
                onClick={handleToggleAll}
                size="sm"
                variant="outline"
              >
                {allExpanded ? copy.inspectCollapseAll : copy.inspectExpandAll}
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={copy.inspectCopy}
                  className="size-7"
                  disabled={loading || !inspect}
                  onClick={handleCopy}
                  size="icon-sm"
                  variant="outline"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copy.inspectCopy}</TooltipContent>
            </Tooltip>
            <fieldset
              aria-label={copy.inspectTitle}
              className="inline-flex h-7 items-center rounded-lg border border-border/60 bg-muted/50 p-0.5"
            >
              <button
                aria-pressed={mode === "tree"}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-md px-2.5 font-medium text-xs transition-all duration-150 active:scale-[0.97]",
                  mode === "tree"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("tree")}
                type="button"
              >
                <Code2 aria-hidden="true" className="size-3.5" />
                {copy.inspectTree}
              </button>
              <button
                aria-pressed={mode === "text"}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-md px-2.5 font-medium text-xs transition-all duration-150 active:scale-[0.97]",
                  mode === "text"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("text")}
                type="button"
              >
                <FileText aria-hidden="true" className="size-3.5" />
                {copy.inspectText}
              </button>
            </fieldset>
          </div>
        </div>
      </CardHeader>
      <CardContent size="none">
        {loading && (
          <div
            aria-hidden="true"
            className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-muted/15 p-3"
          >
            <div className="flex items-center gap-1.5 py-1 pl-1">
              <ChevronRight className="size-3.5 rotate-90 text-muted-foreground/50" />
              <Skeleton className="h-3.5 w-80 max-w-full" variant="table" />
            </div>
            {[
              { keyWidth: "w-28", valWidth: "w-24", expandable: false },
              { keyWidth: "w-14", valWidth: "w-48", expandable: true },
              { keyWidth: "w-16", valWidth: "w-64", expandable: true },
              { keyWidth: "w-20", valWidth: "w-40", expandable: false },
              { keyWidth: "w-24", valWidth: "w-56", expandable: true },
              { keyWidth: "w-16", valWidth: "w-72", expandable: false },
            ].map((row, idx) => (
              <div
                className="flex items-center gap-2 py-1 pl-5"
                key={`inspect-skeleton-${String(idx)}`}
              >
                {row.expandable ? (
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40" />
                ) : (
                  <span className="size-3.5 shrink-0" />
                )}
                <Skeleton
                  className={cn("h-3.5", row.keyWidth)}
                  variant="table"
                />
                <Skeleton
                  className={cn("h-3.5", row.valWidth)}
                  variant="table"
                />
              </div>
            ))}
          </div>
        )}
        {!(loading || inspect) && (
          <p className="py-4 text-muted-foreground text-sm">
            {copy.inspectUnavailable}
          </p>
        )}
        {!loading && inspect && !hasMatches && (
          <p className="rounded-xl border border-border/50 bg-muted/15 p-4 text-muted-foreground text-xs">
            {copy.inspectNoMatches}
          </p>
        )}
        {!loading && inspect && hasMatches && (
          <ScrollArea
            className="max-h-[34rem] w-full min-w-0 max-w-full rounded-xl border border-border/50 bg-muted/15"
            variant="traffic"
            viewportClassName="max-h-[34rem]"
          >
            {mode === "tree" ? (
              <div className="min-w-max p-3">
                <InspectTreeNode
                  depth={0}
                  expandedPaths={expandedPaths}
                  label={rootKey}
                  onToggle={handleTogglePath}
                  path="root"
                  searchQuery={normalizedSearch}
                  value={inspect}
                />
              </div>
            ) : (
              <pre className="min-w-max whitespace-pre p-4 font-mono text-foreground text-xs leading-5">
                {filteredText}
              </pre>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
