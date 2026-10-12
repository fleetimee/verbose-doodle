import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  File01Icon,
  Folder01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useId, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type BrowserFileEntry,
  joinRemotePath,
  parentFilePath,
} from "@/features/server-inventory/utils/terminal-file-browser";

interface ServerFilePaneProps {
  actions?: ReactNode;
  canBack: boolean;
  canForward: boolean;
  disabled: boolean;
  emptyMessage: string;
  entries: BrowserFileEntry[];
  error?: string;
  loading: boolean;
  onBack: () => void;
  onForward: () => void;
  onNavigate: (path: string) => void;
  onOpen: (entry: BrowserFileEntry) => void;
  onRefresh?: () => void;
  onSelect: (name: string) => void;
  path: string;
  rootLabel: string;
  selected: string;
  title: string;
  truncated?: boolean;
}

type SortKey = "name" | "modified" | "size" | "kind";

function displaySize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function ServerFilePane({
  actions,
  canBack,
  canForward,
  disabled,
  emptyMessage,
  entries,
  error,
  loading,
  onBack,
  onForward,
  onNavigate,
  onOpen,
  onRefresh,
  onSelect,
  path,
  rootLabel,
  selected,
  title,
  truncated,
}: ServerFilePaneProps) {
  const { messages, locale } = useI18n();
  const copy = messages.servers;
  const hiddenId = useId();
  const [filter, setFilter] = useState("");
  const [hidden, setHidden] = useState(true);
  const [sort, setSort] = useState<SortKey>("name");
  const [ascending, setAscending] = useState(true);
  const [editingPath, setEditingPath] = useState(false);
  const [draftPath, setDraftPath] = useState(path);
  const visible = useMemo(() => {
    const filtered = entries.filter(
      (entry) =>
        (hidden || !entry.name.startsWith(".")) &&
        entry.name
          .toLocaleLowerCase(locale)
          .includes(filter.toLocaleLowerCase(locale))
    );
    return filtered.sort((a, b) => {
      const directories =
        Number(b.kind === "directory") - Number(a.kind === "directory");
      if (directories !== 0) {
        return directories;
      }
      let comparison = 0;
      if (sort === "size" || sort === "modified") {
        comparison = a[sort] - b[sort];
      } else {
        comparison = a[sort].localeCompare(b[sort], locale, { numeric: true });
      }
      return ascending ? comparison : -comparison;
    });
  }, [entries, filter, hidden, sort, ascending, locale]);
  const breadcrumbs = [{ name: rootLabel, path: "/" }];
  let breadcrumbPath = "";
  for (const segment of path.split("/").filter(Boolean)) {
    breadcrumbPath += `/${segment}`;
    breadcrumbs.push({ name: segment, path: breadcrumbPath });
  }
  const sortDirection = ascending ? "ascending" : "descending";
  const directionIcon = ascending ? ArrowUp01Icon : ArrowDown01Icon;
  const columns = [
    { key: "name", label: copy.name },
    { key: "modified", label: copy.sftpModified },
    { key: "size", label: copy.sftpSize },
    { key: "kind", label: copy.sftpKind },
  ] as const;
  const kindLabels = {
    directory: copy.sftpFolder,
    file: copy.sftpFile,
    symlink: copy.sftpSymlink,
    other: copy.sftpOther,
  };

  return (
    <section
      aria-label={title}
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="flex min-w-0 items-center gap-2 font-semibold text-sm">
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-primary"
            icon={Folder01Icon}
          />
          <span className="truncate">{title}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-1">{actions}</div>
      </header>
      <div className="flex min-w-0 items-center gap-1 border-b px-3 py-2">
        <Button
          aria-label={copy.sftpBack}
          disabled={disabled || !canBack}
          onClick={onBack}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <Button
          aria-label={copy.sftpForward}
          disabled={disabled || !canForward}
          onClick={onForward}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
        <Button
          aria-label={copy.sftpUp}
          disabled={disabled || path === "/"}
          onClick={() => onNavigate(parentFilePath(path))}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} />
        </Button>
        {onRefresh && (
          <Button
            aria-label={copy.sftpRefresh}
            disabled={disabled}
            onClick={onRefresh}
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon icon={RefreshIcon} />
          </Button>
        )}
        {editingPath ? (
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              if (draftPath.trim()) {
                onNavigate(draftPath.trim());
                setEditingPath(false);
              }
            }}
          >
            <Input
              aria-label={copy.sftpPath}
              autoComplete="off"
              disabled={disabled}
              maxLength={4096}
              onChange={(event) => setDraftPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setEditingPath(false);
                  event.stopPropagation();
                }
              }}
              spellCheck={false}
              value={draftPath}
            />
          </form>
        ) : (
          <nav
            aria-label={copy.sftpPath}
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          >
            {breadcrumbs.map((crumb, index) => (
              <div
                className="flex shrink-0 items-center gap-1"
                key={crumb.path}
              >
                {index > 0 && (
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-3 text-muted-foreground"
                    icon={ArrowRight01Icon}
                  />
                )}
                <Button
                  disabled={disabled}
                  onClick={() => onNavigate(crumb.path)}
                  size="sm"
                  variant="ghost"
                >
                  <span className="max-w-40 truncate" title={crumb.name}>
                    {crumb.name}
                  </span>
                </Button>
              </div>
            ))}
          </nav>
        )}
        <Button
          disabled={disabled}
          onClick={() => {
            setDraftPath(path);
            setEditingPath((value) => !value);
          }}
          size="sm"
          variant="ghost"
        >
          {copy.sftpPath}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2">
        <Input
          aria-label={`${copy.sftpFilter} ${title}`}
          className="min-w-28 flex-1"
          onChange={(event) => setFilter(event.target.value)}
          placeholder={copy.sftpFilter}
          value={filter}
        />
        <label
          className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs"
          htmlFor={hiddenId}
        >
          <Checkbox
            checked={hidden}
            id={hiddenId}
            onCheckedChange={(value) => setHidden(value === true)}
          />
          {copy.sftpHidden}
        </label>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div
        aria-busy={loading}
        className="min-h-0 flex-1 overflow-auto [&_[data-slot=table-container]]:overflow-visible"
      >
        <Table className="table-fixed">
          <TableHeader className="sticky top-0 z-10" variant="sticky">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  aria-sort={sort === column.key ? sortDirection : "none"}
                  className={column.key === "name" ? "w-[44%]" : "w-[18%]"}
                  key={column.key}
                >
                  <button
                    className="flex w-full items-center gap-1 py-1 text-left text-xs focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => {
                      if (sort === column.key) {
                        setAscending((value) => !value);
                      } else {
                        setSort(column.key);
                        setAscending(true);
                      }
                    }}
                    type="button"
                  >
                    <span className="truncate">{column.label}</span>
                    {sort === column.key && (
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="size-3 shrink-0"
                        icon={directionIcon}
                      />
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {path !== "/" && (
              <TableRow>
                <TableCell colSpan={4}>
                  <button
                    className="flex w-full items-center gap-2 py-1 focus-visible:outline-2 focus-visible:outline-ring"
                    disabled={disabled}
                    onClick={() => onNavigate(parentFilePath(path))}
                    type="button"
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      className="size-5 text-primary"
                      icon={Folder01Icon}
                    />
                    <span>..</span>
                  </button>
                </TableCell>
              </TableRow>
            )}
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <p
                    className="py-8 text-center text-muted-foreground"
                    role="status"
                  >
                    {copy.sftpLoading}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((entry) => (
                <TableRow
                  data-state={entry.name === selected ? "selected" : undefined}
                  key={entry.name}
                >
                  <TableCell>
                    <button
                      aria-pressed={entry.name === selected}
                      className="flex w-full min-w-0 items-center gap-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-ring"
                      disabled={disabled}
                      onClick={() => onSelect(entry.name)}
                      onDoubleClick={() => {
                        if (entry.kind === "directory") {
                          onNavigate(joinRemotePath(path, entry.name));
                        } else {
                          onOpen(entry);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onOpen(entry);
                        }
                      }}
                      type="button"
                    >
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-primary"
                        icon={
                          entry.kind === "directory" ? Folder01Icon : File01Icon
                        }
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm" title={entry.name}>
                          {entry.name}
                        </span>
                        {entry.permissions && (
                          <span className="font-mono text-muted-foreground text-xs">
                            {entry.permissions}
                          </span>
                        )}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell size="compact" variant="muted">
                    <span
                      className="block truncate"
                      title={
                        entry.modified
                          ? new Date(entry.modified * 1000).toLocaleString(
                              locale
                            )
                          : undefined
                      }
                    >
                      {entry.modified
                        ? new Date(entry.modified * 1000).toLocaleDateString(
                            locale
                          )
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell size="compact" variant="mono">
                    <span className="block truncate">
                      {entry.kind === "directory"
                        ? "—"
                        : displaySize(entry.size)}
                    </span>
                  </TableCell>
                  <TableCell size="compact" variant="muted">
                    <span className="block truncate">
                      {kindLabels[entry.kind]}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <p className="max-w-sm py-8 text-muted-foreground text-sm">
                    {entries.length > 0 ? copy.sftpNoMatches : emptyMessage}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-muted-foreground text-xs">
        <span>
          {visible.length} / {entries.length} {copy.sftpItems}
        </span>
        {truncated && <span role="status">{copy.sftpTruncated}</span>}
      </footer>
    </section>
  );
}
