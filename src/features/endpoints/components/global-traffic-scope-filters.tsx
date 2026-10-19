import { useId } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";

const TRAFFIC_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
  "TRACE",
  "CONNECT",
] as const;

type ScopeOption = { readonly id: string; readonly label: string };

export function GlobalTrafficScopeFilters({
  billerSlug,
  endpointId,
  method,
  onMethodChange,
  onBillerChange,
  onEndpointChange,
}: {
  readonly billerSlug: string;
  readonly endpointId: string;
  readonly method: string;
  readonly onMethodChange: (method: string) => void;
  readonly onBillerChange: (id: string) => void;
  readonly onEndpointChange: (id: string) => void;
}) {
  const { messages } = useI18n();
  const controlId = useId();
  const billers = useGetBillers();
  const { endpoints } = useEndpointCatalog(undefined, true);
  const selectedBiller = billers.data?.find(
    (biller) => biller.slug === billerSlug
  );
  const billerOptions: ScopeOption[] = [
    { id: "", label: messages.endpoints.globalConsole.allBillers },
    ...(billers.data ?? []).map((biller) => ({
      id: biller.slug,
      label: biller.name,
    })),
  ];
  const endpointOptions: ScopeOption[] = [
    { id: "", label: messages.endpoints.globalConsole.allEndpoints },
    ...(endpoints.data ?? [])
      .filter(
        (endpoint) =>
          (!billerSlug || endpoint.billerSlug === selectedBiller?.slug) &&
          (!method || endpoint.method === method)
      )
      .map((endpoint) => ({
        id: endpoint.id,
        label: `${endpoint.url} · ${endpoint.billerName ?? billers.data?.find((biller) => biller.slug === endpoint.billerSlug)?.name ?? endpoint.billerSlug} · ${endpoint.method}`,
      })),
  ];
  const error = billers.error ?? endpoints.error;

  return (
    <>
      <TrafficFilterCombobox
        disabled={billers.isPending || Boolean(billers.error)}
        id={`${controlId}-biller`}
        label={messages.endpoints.billerLabel}
        onChange={(id) => {
          onBillerChange(id);
          onEndpointChange("");
        }}
        options={billerOptions}
        placeholder={messages.endpoints.globalConsole.allBillers}
        value={billerSlug}
      />
      <TrafficFilterCombobox
        disabled={false}
        id={`${controlId}-method`}
        label={messages.endpoints.globalConsole.method}
        onChange={(value) => {
          onMethodChange(value);
          onEndpointChange("");
        }}
        options={[
          { id: "", label: messages.endpoints.globalConsole.allMethods },
          ...TRAFFIC_METHODS.map((value) => ({ id: value, label: value })),
        ]}
        placeholder={messages.endpoints.globalConsole.allMethods}
        value={method}
      />
      <TrafficFilterCombobox
        disabled={endpoints.isPending || Boolean(endpoints.error)}
        id={`${controlId}-endpoint`}
        label={messages.endpoints.endpointLabel}
        onChange={onEndpointChange}
        options={endpointOptions}
        placeholder={messages.endpoints.globalConsole.allEndpoints}
        value={endpointId}
      />
      {error && (
        <div
          className="flex flex-wrap items-center gap-2 text-destructive text-xs sm:col-span-2 lg:col-span-5"
          role="alert"
        >
          <span>{error.message}</span>
          <Button
            onClick={() => {
              billers.refetch();
              endpoints.refetch();
            }}
            size="sm"
            variant="outline"
          >
            {messages.endpoints.trafficLogsRefreshButton}
          </Button>
        </div>
      )}
    </>
  );
}

export function TrafficFilterCombobox({
  id,
  label,
  placeholder,
  options,
  value,
  disabled,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly options: ScopeOption[];
  readonly value: string;
  readonly disabled: boolean;
  readonly onChange: (id: string) => void;
}) {
  const { messages } = useI18n();
  return (
    <Field>
      <FieldLabel className="sr-only" htmlFor={id}>
        {label}
      </FieldLabel>
      <Combobox
        disabled={disabled}
        items={options}
        itemToStringLabel={(option: ScopeOption) => option.label}
        itemToStringValue={(option: ScopeOption) => option.label}
        onValueChange={(option: ScopeOption | null) =>
          onChange(option?.id ?? "")
        }
        value={options.find((option) => option.id === value) ?? null}
      >
        <ComboboxInput
          aria-label={label}
          disabled={disabled}
          id={id}
          placeholder={placeholder}
          triggerLabel={label}
        />
        <ComboboxContent size="filter">
          <ComboboxEmpty>
            {messages.endpoints.globalConsole.noOptions}
          </ComboboxEmpty>
          <ComboboxList>
            {(option: ScopeOption) => (
              <ComboboxItem key={option.id} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
