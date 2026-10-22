import { useInfiniteQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription } from "@/components/ui/field";
import { SourceFieldLabel } from "@/features/log-viewer/source-field-label";
import { fetchServerEntries } from "@/features/server-inventory/api";
import type { ServerEntry } from "@/features/server-inventory/types";

interface HostOption {
  entry: ServerEntry | null;
  host: string;
  key: string;
}

export function SourceServerPicker({
  disabled,
  host,
  onHostChange,
  portalContainer,
  value,
  onSelect,
}: {
  disabled: boolean;
  host: string;
  onHostChange: (host: string) => void;
  portalContainer: HTMLDivElement | null;
  value: ServerEntry | null;
  onSelect: (server: ServerEntry | null) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const query = useInfiniteQuery({
    queryKey: ["log-source-inventory", search],
    enabled: open,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchServerEntries({
        page: pageParam,
        size: 25,
        search,
        accessType: "",
        databaseEngine: "",
        sortBy: "name",
        direction: "asc",
      }),
    getNextPageParam: (page) =>
      page.page + 1 < page.totalPages ? page.page + 1 : undefined,
  });
  const servers = query.data?.pages.flatMap((page) => page.servers) ?? [];
  const manualOption: HostOption = { key: "manual", host, entry: null };
  const inventoryOptions: HostOption[] = servers.map((entry) => ({
    key: entry.id,
    host: entry.host,
    entry,
  }));
  const options = host.trim()
    ? [...inventoryOptions, manualOption]
    : inventoryOptions;
  let selectedOption: HostOption | null = host.trim() ? manualOption : null;
  if (value) {
    selectedOption = { key: value.id, host: value.host, entry: value };
  }
  return (
    <Field data-disabled={disabled}>
      <SourceFieldLabel
        field="host"
        htmlFor={id}
        portalContainer={portalContainer}
      />
      <Combobox
        filter={null}
        inputValue={host}
        isItemEqualToValue={(a, b) => a.key === b.key}
        items={options}
        itemToStringLabel={(server) => server.host}
        onInputValueChange={(next, details) => {
          if (
            details.reason === "input-change" ||
            details.reason === "input-clear"
          ) {
            setSearch(next);
            onHostChange(next);
          }
        }}
        onOpenChange={(next) => {
          setOpen(next);
          if (next && value) {
            setSearch("");
          }
        }}
        onValueChange={(option) => {
          if (!option) {
            return;
          }
          if (option.entry) {
            onSelect(option.entry);
          } else {
            onSelect(null);
            onHostChange(option.host);
          }
        }}
        open={open}
        value={selectedOption}
      >
        <ComboboxInput
          autoComplete="off"
          disabled={disabled}
          id={id}
          maxLength={255}
          placeholder={copy.inventoryChoose}
          required
          triggerLabel={copy.inventoryServer}
        />
        <ComboboxContent portalContainer={portalContainer}>
          <ComboboxList>
            {(option: HostOption) => (
              <ComboboxItem key={option.key} value={option}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">
                    {option.entry
                      ? `${option.entry.name} · ${option.host}`
                      : option.host}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {option.entry
                      ? `${option.entry.accessType} · ${option.entry.username || "—"}`
                      : copy.inventoryManual}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
          {query.isSuccess && servers.length === 0 && (
            <p className="p-3 text-muted-foreground text-sm">
              {copy.inventoryEmpty}
            </p>
          )}
          {query.isFetching && (
            <p className="p-3 text-muted-foreground text-sm">
              {copy.inventoryLoading}
            </p>
          )}
          {query.isError && (
            <Button
              onClick={() => query.refetch()}
              type="button"
              variant="ghost"
            >
              {copy.retry}
            </Button>
          )}
          {query.hasNextPage && (
            <Button
              disabled={query.isFetching}
              onClick={() => query.fetchNextPage()}
              type="button"
              variant="ghost"
            >
              {copy.inventoryMore}
            </Button>
          )}
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        {value ? `${value.name} · ${value.accessType}` : copy.inventoryHint}
      </FieldDescription>
    </Field>
  );
}
