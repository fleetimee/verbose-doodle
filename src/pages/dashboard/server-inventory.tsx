import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Server } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context";
import { ServerEntryDrawer } from "@/features/server-inventory/components/server-entry-drawer";
import { ServerInventoryTable } from "@/features/server-inventory/components/server-inventory-table";
import { useServerInventory } from "@/features/server-inventory/hooks/use-server-inventory";
import type {
  ServerEntry,
  ServerEntryRequest,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";

export function ServerInventoryPage() {
  const { messages } = useI18n();
  const copy = messages.servers;
  const { snapshot } = useAuth();
  const isAdmin = snapshot.user?.role === "ADMIN";
  const [query, setQuery] = useState<ServerInventoryQuery>({
    page: 0,
    size: 50,
    search: "",
    accessType: "",
    databaseEngine: "",
    sortBy: "name",
    direction: "asc",
  });
  const { entries, accessTypes, hosts, save, remove } =
    useServerInventory(query);
  useEffect(() => {
    if (
      entries.data &&
      !entries.isPlaceholderData &&
      query.page > 0 &&
      query.page >= entries.data.totalPages
    ) {
      setQuery((current) => ({
        ...current,
        page: Math.max(0, entries.data.totalPages - 1),
      }));
    }
  }, [entries.data, entries.isPlaceholderData, query.page]);
  const [editing, setEditing] = useState<ServerEntry | "new" | null>(null);
  const [deleting, setDeleting] = useState<ServerEntry | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  useDocumentMeta({
    description: copy.documentDescription,
    title: copy.documentTitle,
  });

  const saveEntry = async (request: ServerEntryRequest, id?: string) => {
    try {
      return await save.mutateAsync({ id, request });
    } finally {
      save.reset();
    }
  };
  const deleteEntry = async () => {
    if (!deleting) {
      return;
    }
    setDeleteError(null);
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
      toast.success(copy.deleteSuccess);
    } catch (cause) {
      setDeleteError(getErrorMessage(cause));
    }
  };
  const addButton = (
    <Button onClick={() => setEditing("new")}>
      <Plus data-icon="inline-start" />
      {copy.add}
    </Button>
  );
  const data = entries.data?.servers ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-3xl tracking-tight">{copy.title}</h1>
          <p className="text-muted-foreground">{copy.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={entries.isFetching}
            onClick={() => entries.refetch()}
            variant="outline"
          >
            {entries.isFetching ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            {copy.refresh}
          </Button>
          {isAdmin && addButton}
        </div>
      </div>
      {entries.isError && (
        <Alert variant="destructive">
          <AlertTitle>{copy.loadError}</AlertTitle>
          <AlertDescription>{getErrorMessage(entries.error)}</AlertDescription>
        </Alert>
      )}
      {entries.isPending && <DataTableSkeleton columns={7} rows={8} />}
      {!(entries.isPending || entries.isError) &&
        data.length === 0 &&
        !query.search &&
        !query.accessType &&
        !query.databaseEngine && (
          <Empty variant="bordered">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Server />
              </EmptyMedia>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
            </EmptyHeader>
            {isAdmin && <EmptyContent>{addButton}</EmptyContent>}
          </Empty>
        )}
      {entries.data && (
        <ServerInventoryTable
          accessTypes={entries.data.accessTypes}
          databaseEngines={entries.data.databaseEngines}
          entries={data}
          isAdmin={isAdmin}
          loading={entries.isFetching}
          onDelete={(entry) => {
            setDeleteError(null);
            setDeleting(entry);
          }}
          onEdit={setEditing}
          onQueryChange={setQuery}
          query={query}
          totalElements={entries.data.totalElements}
          totalHosts={entries.data.totalHosts}
          totalPages={entries.data.totalPages}
        />
      )}
      {isAdmin && editing && (
        <ServerEntryDrawer
          entry={editing === "new" ? undefined : editing}
          hosts={hosts.data ?? []}
          key={editing === "new" ? "new" : editing.id}
          onClose={() => setEditing(null)}
          onSave={saveEntry}
          saving={save.isPending}
          types={accessTypes.data ?? data.map((entry) => entry.accessType)}
        />
      )}
      {isAdmin && deleting && (
        <AlertDialog
          onOpenChange={(open) => {
            if (!(open || remove.isPending)) {
              setDeleting(null);
            }
          }}
          open
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{copy.deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {formatMessage(copy.deleteDescription, {
                  name: deleting.name,
                  host: deleting.host,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <Alert variant="destructive">
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={remove.isPending}>
                {messages.common.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={remove.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  deleteEntry();
                }}
                variant="destructive"
              >
                {remove.isPending && <Spinner data-icon="inline-start" />}
                {remove.isPending ? messages.common.deleting : copy.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
