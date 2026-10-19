import {
  Add01Icon,
  HelpCircleIcon,
  Pen01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { Check, ChevronDown, ListFilter } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { useTour } from "@/components/tour";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Postman } from "@/components/ui/svgs/postman";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { useAuth } from "@/features/auth/context";
import { EditBillerDialog } from "@/features/billers/components/edit-biller-dialog";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import { useUpdateBiller } from "@/features/billers/hooks/use-update-biller";
import type { Biller } from "@/features/billers/types";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { DeleteEndpointDialog } from "@/features/endpoints/components/delete-endpoint-dialog";
import { EditEndpointSheet } from "@/features/endpoints/components/edit-endpoint-sheet";
import { EndpointTable } from "@/features/endpoints/components/endpoint-table";
import { EndpointsSearchControls } from "@/features/endpoints/components/endpoints-search-controls";
import { ExportEndpointsDialog } from "@/features/endpoints/components/export-endpoints-dialog";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import {
  defaultEndpointQuery,
  useEndpointPage,
} from "@/features/endpoints/hooks/use-endpoint-page";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type {
  Endpoint,
  EndpointListItem,
  EndpointListQuery,
  EndpointViewMode,
  GroupedEndpoints,
} from "@/features/endpoints/types";
import { groupEndpointsByBiller } from "@/features/endpoints/utils";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatMessage } from "@/lib/i18n";

const initialQuery = defaultEndpointQuery;

function EndpointFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={label}
          className="min-w-0 max-w-full"
          data-active={!!value}
          role="combobox"
          size="sm"
          variant="inventory-filter"
        >
          <ListFilter />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">
                {options.find((option) => option.value === value)?.label ??
                  (value || label)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {label}
              {value
                ? `: ${options.find((option) => option.value === value)?.label ?? value}`
                : ""}
            </TooltipContent>
          </Tooltip>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-64"
        size="none"
      >
        <Command>
          <CommandInput aria-label={label} placeholder={label} />
          <CommandList>
            <CommandEmpty>{messages.common.noResults}</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => select("")} value={label}>
                {label}
                {!value && <Check className="ml-auto" />}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => select(option.value)}
                  value={`${option.label} ${option.value}`}
                >
                  {option.label}
                  {value === option.value && <Check className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function matchesExport(endpoint: Endpoint, query: EndpointListQuery) {
  const search = query.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [
      endpoint.url,
      endpoint.method,
      endpoint.billerSlug,
      endpoint.billerName ?? "",
      ...endpoint.responses.flatMap((response) => [
        response.name,
        response.json,
      ]),
    ].some((value) => value.toLowerCase().includes(search));
  const active = endpoint.responses.some((response) => response.activated);
  return (
    matchesSearch &&
    (!query.billerSlug || endpoint.billerSlug === query.billerSlug) &&
    (!query.method || endpoint.method === query.method) &&
    (!query.enabled || String(endpoint.enabled !== false) === query.enabled) &&
    (!query.responseStatus || active === (query.responseStatus === "active"))
  );
}

export function EndpointsPage() {
  const { messages } = useI18n();
  const copy = messages.endpoints.table;
  useDocumentMeta({
    description: messages.endpoints.documentDescription,
    title: messages.endpoints.documentTitle,
  });
  const [params, setParams] = useSearchParams();
  const billerSlug = params.get("billerSlug") ?? "";
  const [queryState, setQueryState] = useState(initialQuery);
  const [search, setSearch] = useState("");
  const [storedViewMode, setViewMode] = useLocalStorage<EndpointViewMode>(
    "endpoints-view-mode",
    "table"
  );
  const viewMode =
    storedViewMode === "grid" || storedViewMode === "list"
      ? storedViewMode
      : "table";
  const query = useMemo(
    () => ({ ...queryState, billerSlug }),
    [queryState, billerSlug]
  );
  const entries = useEndpointPage(query);
  const { data: billers = [], isPending: loadingBillers } = useGetBillers();
  const { session } = useAuth();
  const canEdit = session.can("canEditEndpoint");
  const catalog = useEndpointCatalog(undefined, false);
  const updateBiller = useUpdateBiller();
  const [addOpen, setAddOpen] = useState(false);
  const [createBillerSlug, setCreateBillerSlug] = useState<
    string | undefined
  >();
  const [endpointToEdit, setEndpointToEdit] = useState<Endpoint | null>(null);
  const [endpointToDelete, setEndpointToDelete] = useState<Endpoint | null>(
    null
  );
  const [billerToEdit, setBillerToEdit] = useState<Biller | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportGroups, setExportGroups] = useState<GroupedEndpoints[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const { setSteps, startTour } = useTour();
  const selectedBiller = billers.find((biller) => biller.slug === billerSlug);
  const unknownBiller =
    Boolean(billerSlug) && !loadingBillers && !selectedBiller;

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setQueryState((current) =>
          current.search === search.trim()
            ? current
            : { ...current, search: search.trim(), page: 0 }
        ),
      300
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setQueryState((current) =>
      current.page === 0 ? current : { ...current, page: 0 }
    );
  }, [billerSlug]);

  useEffect(() => {
    if (
      entries.data &&
      !entries.isPlaceholderData &&
      !entries.isFetching &&
      query.page > 0 &&
      query.page >= entries.data.totalPages
    ) {
      setQueryState((current) => ({
        ...current,
        page: Math.max(0, (entries.data?.totalPages ?? 1) - 1),
      }));
    }
  }, [entries.data, entries.isFetching, entries.isPlaceholderData, query.page]);

  const openCreateEndpoint = (slug = selectedBiller?.slug) => {
    setCreateBillerSlug(slug);
    setAddOpen(true);
  };

  const changeQuery = (next: EndpointListQuery) => {
    setQueryState(next);
    if (next.billerSlug !== billerSlug) {
      setParams((current) => {
        const result = new URLSearchParams(current);
        if (next.billerSlug) {
          result.set("billerSlug", next.billerSlug);
        } else {
          result.delete("billerSlug");
        }
        return result;
      });
    }
  };
  const filter = (changes: Partial<EndpointListQuery>) =>
    changeQuery({ ...query, ...changes, page: 0 });
  const reset = () => {
    setSearch("");
    changeQuery({ ...initialQuery, size: query.size });
  };
  const loadAction = async (
    item: EndpointListItem,
    action: "edit" | "delete"
  ) => {
    setLoadingAction(true);
    try {
      const endpoint = await httpEndpointAdapter.getEndpoint(item.slug);
      if (!endpoint) {
        toast.error(messages.endpoints.endpointNoLongerExists);
        return;
      }
      if (action === "edit") {
        setEndpointToEdit(endpoint);
      } else {
        setEndpointToDelete(endpoint);
      }
    } catch {
      toast.error(copy.error);
    } finally {
      setLoadingAction(false);
    }
  };
  const exportEndpoints = async () => {
    setExporting(true);
    try {
      const endpoints = await httpEndpointAdapter.listEndpoints();
      setExportGroups(
        groupEndpointsByBiller(
          endpoints.filter((endpoint) => matchesExport(endpoint, query))
        )
      );
      setExportOpen(true);
    } catch {
      toast.error(copy.error);
    } finally {
      setExporting(false);
    }
  };
  const startIntro = () => {
    setSteps([
      {
        selectorId: "endpoints-tour-header",
        position: "bottom",
        content: <p>{messages.endpoints.tour.workspaceDescription}</p>,
      },
      {
        selectorId: "endpoints-tour-search",
        position: "bottom",
        content: <p>{messages.endpoints.tour.searchDescription}</p>,
      },
      {
        selectorId: "endpoints-tour-view-mode",
        position: "bottom",
        content: <p>{messages.endpoints.tour.viewModeDescription}</p>,
      },
      {
        selectorId: "endpoints-tour-export",
        position: "left",
        content: <p>{copy.exportScope}</p>,
      },
      ...(entries.data?.endpoints.length
        ? [
            {
              selectorId: "endpoints-tour-first-endpoint",
              position: "top" as const,
              content: <p>{messages.endpoints.tour.detailsDescription}</p>,
            },
          ]
        : []),
    ]);
    startTour("endpoints-intro");
  };
  const submitEdit = (data: EndpointFormData) => {
    if (endpointToEdit) {
      catalog.updateEndpoint.mutate(
        {
          endpointSlug: endpointToEdit.slug,
          changes: { method: data.method, url: data.url },
        },
        { onSuccess: () => setEndpointToEdit(null) }
      );
    }
  };
  return (
    <div className="flex min-w-0 flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <div
        className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center"
        id="endpoints-tour-header"
      >
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            {messages.endpoints.pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {messages.endpoints.pageDescription}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={startIntro} size="sm" variant="outline">
            <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
            {messages.endpoints.tour.startButton}
          </Button>
          <ProtectedAction ability="canAddEndpoint">
            <AddEndpointSheet
              initialBillerSlug={createBillerSlug}
              isSubmitting={catalog.createEndpoint.isPending}
              onOpenChange={setAddOpen}
              onSubmit={(data) =>
                catalog.createEndpoint.mutate(data, {
                  onSuccess: () => setAddOpen(false),
                })
              }
              onTriggerClick={() => openCreateEndpoint()}
              open={addOpen}
              showTrigger={false}
            />
            <Button
              disabled={unknownBiller}
              onClick={() => openCreateEndpoint()}
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              {messages.endpoints.addEndpoint}
            </Button>
          </ProtectedAction>
        </div>
      </div>
      <EndpointTable
        actionPending={loadingAction || catalog.updateEndpoint.isPending}
        canEdit={canEdit}
        data={entries.data}
        error={entries.isError}
        fetching={entries.isFetching}
        loading={entries.isPending}
        onAddEndpoint={
          session.can("canAddEndpoint") ? openCreateEndpoint : undefined
        }
        onCreate={
          session.can("canAddEndpoint") && !unknownBiller
            ? () => openCreateEndpoint()
            : undefined
        }
        onDelete={(item) => loadAction(item, "delete")}
        onEdit={(item) => loadAction(item, "edit")}
        onEditBiller={
          session.can("canAddBiller")
            ? (slug, name) =>
                setBillerToEdit(
                  billers.find((biller) => biller.slug === slug) ?? {
                    slug,
                    name,
                  }
                )
            : undefined
        }
        onQueryChange={changeQuery}
        onReset={reset}
        onRetry={() => entries.refetch()}
        query={query}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <div className="contents">
              <div className="contents">
                <EndpointsSearchControls
                  actions={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          disabled={
                            exporting ||
                            entries.isFetching ||
                            entries.isError ||
                            !entries.data?.totalElements
                          }
                          id="endpoints-tour-export"
                          onClick={exportEndpoints}
                          size="sm"
                          variant="outline"
                        >
                          {exporting ? (
                            <Spinner />
                          ) : (
                            <Postman className="size-4" />
                          )}
                          {messages.endpoints.exportToPostman}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {copy.exportScope}
                      </TooltipContent>
                    </Tooltip>
                  }
                  onSearchChange={setSearch}
                  onViewModeChange={setViewMode}
                  searchId="endpoints-tour-search"
                  searchPlaceholder={copy.search}
                  searchValue={search}
                  viewMode={viewMode}
                  viewModeId="endpoints-tour-view-mode"
                />
              </div>
            </div>
            <div className="flex max-w-full shrink-0 items-center gap-2">
              <div className="h-6 shrink-0">
                <Separator orientation="vertical" />
              </div>
              <ButtonGroup
                aria-label={copy.filters}
                className="min-w-0 overflow-x-auto"
              >
                <EndpointFilter
                  label={copy.allBillers}
                  onChange={(value) => filter({ billerSlug: value })}
                  options={billers.map((biller) => ({
                    value: biller.slug,
                    label: biller.name,
                  }))}
                  value={billerSlug}
                />
                <EndpointFilter
                  label={copy.allMethods}
                  onChange={(value) => filter({ method: value })}
                  options={[
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "HEAD",
                    "OPTIONS",
                  ].map((value) => ({ value, label: value }))}
                  value={query.method}
                />

                <EndpointFilter
                  label={copy.allStatuses}
                  onChange={(value) => filter({ enabled: value })}
                  options={[
                    { value: "true", label: messages.common.enabled },
                    { value: "false", label: messages.common.disabled },
                  ]}
                  value={query.enabled}
                />
                <EndpointFilter
                  label={copy.allResponses}
                  onChange={(value) => filter({ responseStatus: value })}
                  options={[
                    { value: "active", label: copy.active },
                    { value: "inactive", label: copy.inactive },
                  ]}
                  value={query.responseStatus}
                />
              </ButtonGroup>
              {(search ||
                billerSlug ||
                query.method ||
                query.enabled ||
                query.responseStatus) && (
                <Button onClick={reset} size="sm" variant="ghost">
                  {copy.reset}
                </Button>
              )}
              {selectedBiller && (
                <ProtectedAction ability="canAddBiller">
                  <Button
                    aria-label={formatMessage(
                      messages.endpoints.editBillerTooltip,
                      {
                        billerName: selectedBiller.name,
                      }
                    )}
                    onClick={() => setBillerToEdit(selectedBiller)}
                    size="sm"
                    variant="outline"
                  >
                    <HugeiconsIcon icon={Pen01Icon} strokeWidth={2} />
                    {selectedBiller.name}
                  </Button>
                </ProtectedAction>
              )}
            </div>
            {unknownBiller && (
              <Alert>
                <AlertDescription>
                  {messages.endpoints.billerNotFoundDescription}
                </AlertDescription>
              </Alert>
            )}
          </div>
        }
        viewMode={viewMode}
      />
      <ProtectedAction ability="canEditEndpoint">
        <EditEndpointSheet
          endpoint={endpointToEdit}
          isSubmitting={catalog.updateEndpoint.isPending}
          onOpenChange={(open) => {
            if (!open) {
              setEndpointToEdit(null);
            }
          }}
          onSubmit={submitEdit}
          open={endpointToEdit !== null}
        />
        <DeleteEndpointDialog
          endpoint={endpointToDelete}
          isDeleting={catalog.deleteEndpoint.isPending}
          onConfirm={() => {
            if (endpointToDelete) {
              catalog.deleteEndpoint.mutate(endpointToDelete.slug, {
                onSuccess: () => setEndpointToDelete(null),
              });
            }
          }}
          onOpenChange={(open) => {
            if (!open) {
              setEndpointToDelete(null);
            }
          }}
          open={endpointToDelete !== null}
        />
      </ProtectedAction>
      <ProtectedAction ability="canAddBiller">
        <EditBillerDialog
          biller={billerToEdit}
          isSubmitting={updateBiller.isPending}
          onOpenChange={(open) => {
            if (!open) {
              setBillerToEdit(null);
            }
          }}
          onSubmit={(data) => {
            if (billerToEdit) {
              updateBiller.mutate(
                { slug: billerToEdit.slug, billerName: data },
                { onSuccess: () => setBillerToEdit(null) }
              );
            }
          }}
          open={billerToEdit !== null}
        />
      </ProtectedAction>
      <ExportEndpointsDialog
        groupedEndpoints={exportGroups}
        onOpenChange={setExportOpen}
        open={exportOpen}
      />
    </div>
  );
}
