import { DownloadIcon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  CheckCircle2,
  FileJson,
  Layers3,
} from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Postman } from "@/components/ui/svgs/postman";
import type { GroupedEndpoints, HttpMethod } from "@/features/endpoints/types";
import { exportPostmanWithEnvironment } from "@/features/endpoints/utils/export-to-postman";
import { getMethodBadgeColor } from "@/features/endpoints/utils/http-method-colors";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ExportEndpointsDialogProps = {
  readonly groupedEndpoints: GroupedEndpoints[];
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
};

type ExportSummary = {
  readonly billers: number;
  readonly endpoints: number;
  readonly methods: Readonly<Record<HttpMethod, number>>;
  readonly responses: number;
  readonly withActiveResponse: number;
};

const POSTMAN_EXPORT_MESSAGES = messages.endpoints.postmanExport;
const DEFAULT_COLLECTION_NAME = POSTMAN_EXPORT_MESSAGES.defaultCollectionName;
const DEFAULT_ENVIRONMENT_NAME = POSTMAN_EXPORT_MESSAGES.defaultEnvironmentName;
const HTTP_METHODS: readonly HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

function createBillerIdSet(groups: readonly GroupedEndpoints[]) {
  return new Set(groups.map((group) => group.billerId));
}

function getSummary(groups: readonly GroupedEndpoints[]): ExportSummary {
  const methods = {
    DELETE: 0,
    GET: 0,
    PATCH: 0,
    POST: 0,
    PUT: 0,
  } satisfies Record<HttpMethod, number>;

  let endpoints = 0;
  let responses = 0;
  let withActiveResponse = 0;

  for (const group of groups) {
    endpoints += group.endpoints.length;

    for (const endpoint of group.endpoints) {
      methods[endpoint.method] += 1;
      responses += endpoint.responses.length;

      if (endpoint.responses.some((response) => response.activated)) {
        withActiveResponse += 1;
      }
    }
  }

  return {
    billers: groups.length,
    endpoints,
    methods,
    responses,
    withActiveResponse,
  };
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getPostmanFilename(name: string, suffix: string) {
  const safeName = name.trim().toLowerCase().replaceAll(" ", "-");
  return `${safeName || POSTMAN_EXPORT_MESSAGES.collectionFilenameFallback}-[timestamp].${suffix}.json`;
}

function getSelectionState(allSelected: boolean, someSelected: boolean) {
  if (allSelected) {
    return true;
  }

  if (someSelected) {
    return "indeterminate";
  }

  return false;
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: typeof FileJson;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background/80 p-3 shadow-xs">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-2 font-semibold text-lg leading-none">{value}</p>
    </div>
  );
}

function MethodCoverage({ summary }: { readonly summary: ExportSummary }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {HTTP_METHODS.map((method) => {
        const count = summary.methods[method];

        return (
          <Badge
            className={cn(
              "rounded-md border font-mono shadow-xs",
              getMethodBadgeColor(method),
              count === 0 && "opacity-45 saturate-0"
            )}
            key={method}
            variant="outline"
          >
            {method} {count}
          </Badge>
        );
      })}
    </div>
  );
}

function ExportFilePreview({
  collectionName,
  environmentName,
}: {
  readonly collectionName: string;
  readonly environmentName: string;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-dashed bg-muted/35 p-3 text-xs">
      <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
        <FileJson className="h-3.5 w-3.5 text-orange-500" />
        <span className="min-w-0 break-all font-mono leading-relaxed">
          {getPostmanFilename(collectionName, "postman_collection")}
        </span>
      </div>
      <div className="flex min-w-0 items-start gap-2 text-muted-foreground">
        <Braces className="h-3.5 w-3.5 text-emerald-500" />
        <span className="min-w-0 break-all font-mono leading-relaxed">
          {getPostmanFilename(environmentName, "postman_environment")}
        </span>
      </div>
    </div>
  );
}

export function ExportEndpointsDialog({
  groupedEndpoints,
  onOpenChange,
  open,
}: ExportEndpointsDialogProps) {
  const [collectionName, setCollectionName] = useState<string>(
    DEFAULT_COLLECTION_NAME
  );
  const [environmentName, setEnvironmentName] = useState<string>(
    DEFAULT_ENVIRONMENT_NAME
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBillerIds, setSelectedBillerIds] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (open) {
      setCollectionName(DEFAULT_COLLECTION_NAME);
      setEnvironmentName(DEFAULT_ENVIRONMENT_NAME);
      setSearchTerm("");
      setSelectedBillerIds(createBillerIdSet(groupedEndpoints));
    }
  }, [open, groupedEndpoints]);

  const visibleGroups = useMemo(() => {
    const search = normalizeSearch(searchTerm);

    if (!search) {
      return groupedEndpoints;
    }

    return groupedEndpoints.filter((group) => {
      const matchesBiller = group.billerName.toLowerCase().includes(search);
      const matchesEndpoint = group.endpoints.some((endpoint) =>
        endpoint.url.toLowerCase().includes(search)
      );

      return matchesBiller || matchesEndpoint;
    });
  }, [groupedEndpoints, searchTerm]);

  const selectedGroups = useMemo(
    () =>
      groupedEndpoints.filter((group) => selectedBillerIds.has(group.billerId)),
    [groupedEndpoints, selectedBillerIds]
  );

  const visibleSelectedCount = visibleGroups.filter((group) =>
    selectedBillerIds.has(group.billerId)
  ).length;
  const allSelected = selectedBillerIds.size === groupedEndpoints.length;
  const someSelected = selectedBillerIds.size > 0 && !allSelected;
  const checkboxState = getSelectionState(allSelected, someSelected);
  const totalSummary = useMemo(
    () => getSummary(groupedEndpoints),
    [groupedEndpoints]
  );
  const selectedSummary = useMemo(
    () => getSummary(selectedGroups),
    [selectedGroups]
  );
  const canExport =
    selectedGroups.length > 0 &&
    collectionName.trim().length > 0 &&
    environmentName.trim().length > 0;

  const handleToggleAll = () => {
    setSelectedBillerIds(
      allSelected ? new Set() : createBillerIdSet(groupedEndpoints)
    );
  };

  const handleSelectVisible = () => {
    setSelectedBillerIds((current) => {
      const nextSelected = new Set(current);

      for (const group of visibleGroups) {
        nextSelected.add(group.billerId);
      }

      return nextSelected;
    });
  };

  const handleToggleBiller = (billerId: number) => {
    setSelectedBillerIds((current) => {
      const nextSelected = new Set(current);

      if (nextSelected.has(billerId)) {
        nextSelected.delete(billerId);
      } else {
        nextSelected.add(billerId);
      }

      return nextSelected;
    });
  };

  const handleExport = () => {
    if (!canExport) {
      return;
    }

    exportPostmanWithEnvironment(
      selectedGroups,
      collectionName.trim(),
      environmentName.trim()
    );
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[920px]">
        <div className="relative border-b bg-muted/25 px-6 py-5">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.75),#ff6c37,transparent)]"
          />
          <DialogHeader className="relative gap-3">
            <div className="flex items-start gap-4 pr-8">
              <div className="space-y-1">
                <DialogTitle className="flex flex-wrap items-center gap-2 text-xl">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-xs">
                    <Postman className="h-5 w-5" />
                  </span>
                  {messages.endpoints.exportToPostman}
                  <Badge className="rounded-md text-xs" variant="outline">
                    {POSTMAN_EXPORT_MESSAGES.collectionEnvironmentBadge}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {POSTMAN_EXPORT_MESSAGES.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="collection-name">
                  {POSTMAN_EXPORT_MESSAGES.collectionNameLabel}
                </Label>
                <Input
                  id="collection-name"
                  onChange={(event) => setCollectionName(event.target.value)}
                  value={collectionName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment-name">
                  {POSTMAN_EXPORT_MESSAGES.environmentNameLabel}
                </Label>
                <Input
                  id="environment-name"
                  onChange={(event) => setEnvironmentName(event.target.value)}
                  value={environmentName}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <HugeiconsIcon
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    icon={SearchIcon}
                    strokeWidth={2}
                  />
                  <Input
                    className="pl-9"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={POSTMAN_EXPORT_MESSAGES.searchPlaceholder}
                    value={searchTerm}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSelectVisible}
                    size="sm"
                    variant="outline"
                  >
                    {POSTMAN_EXPORT_MESSAGES.selectVisibleButton}
                  </Button>
                  <Button
                    onClick={() => setSelectedBillerIds(new Set())}
                    size="sm"
                    variant="ghost"
                  >
                    {POSTMAN_EXPORT_MESSAGES.clearButton}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checkboxState === true}
                    id="select-all"
                    indeterminate={checkboxState === "indeterminate"}
                    onCheckedChange={handleToggleAll}
                  />
                  <Label className="font-medium text-sm" htmlFor="select-all">
                    {POSTMAN_EXPORT_MESSAGES.selectAllBillers}
                  </Label>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatMessage(POSTMAN_EXPORT_MESSAGES.visibleSelected, {
                    selected: visibleSelectedCount,
                    total: visibleGroups.length,
                  })}
                </span>
              </div>

              <ScrollArea className="h-[292px]">
                <div className="grid gap-2 p-3">
                  {visibleGroups.map((group, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "group flex items-start gap-3 rounded-md border p-3 transition-colors",
                        selectedBillerIds.has(group.billerId)
                          ? "border-primary/30 bg-primary/5"
                          : "bg-background hover:bg-muted/45"
                      )}
                      initial={{ opacity: 0, y: 8 }}
                      key={group.billerId}
                      transition={{ delay: Math.min(index, 8) * 0.025 }}
                    >
                      <Checkbox
                        checked={selectedBillerIds.has(group.billerId)}
                        id={`biller-${group.billerId}`}
                        onCheckedChange={() =>
                          handleToggleBiller(group.billerId)
                        }
                      />
                      <Label
                        className="grid min-w-0 flex-1 cursor-pointer gap-1"
                        htmlFor={`biller-${group.billerId}`}
                      >
                        <span className="truncate font-medium text-sm">
                          {group.billerName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatPluralMessage(
                            POSTMAN_EXPORT_MESSAGES.packagedFolder,
                            group.endpoints.length
                          )}
                        </span>
                      </Label>
                      {selectedBillerIds.has(group.billerId) && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      )}
                    </motion.div>
                  ))}

                  {visibleGroups.length === 0 && (
                    <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
                      {POSTMAN_EXPORT_MESSAGES.noSearchResults}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <SummaryTile
                icon={Layers3}
                label={POSTMAN_EXPORT_MESSAGES.billersLabel}
                value={`${selectedSummary.billers}/${totalSummary.billers}`}
              />
              <SummaryTile
                icon={FileJson}
                label={POSTMAN_EXPORT_MESSAGES.endpointsLabel}
                value={`${selectedSummary.endpoints}`}
              />
              <SummaryTile
                icon={Braces}
                label={POSTMAN_EXPORT_MESSAGES.responsesLabel}
                value={`${selectedSummary.responses}`}
              />
              <SummaryTile
                icon={CheckCircle2}
                label={POSTMAN_EXPORT_MESSAGES.activeLabel}
                value={`${selectedSummary.withActiveResponse}`}
              />
            </div>

            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm">
                  {POSTMAN_EXPORT_MESSAGES.methodCoverageTitle}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {POSTMAN_EXPORT_MESSAGES.methodCoverageDescription}
                </p>
              </div>
              <MethodCoverage summary={selectedSummary} />
            </div>

            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm">
                  {POSTMAN_EXPORT_MESSAGES.downloadManifestTitle}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {POSTMAN_EXPORT_MESSAGES.downloadManifestDescription}
                </p>
              </div>
              <ExportFilePreview
                collectionName={collectionName}
                environmentName={environmentName}
              />
            </div>
          </aside>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {POSTMAN_EXPORT_MESSAGES.cancelButton}
          </Button>
          <Button disabled={!canExport} onClick={handleExport}>
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={DownloadIcon}
              strokeWidth={2}
            />
            {POSTMAN_EXPORT_MESSAGES.exportButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
