import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Biller } from "@/features/billers/types";
import {
  type EndpointFormData,
  endpointSchema,
  httpMethods,
} from "@/features/endpoints/schemas/endpoint-schema";
import { getMethodTextColor } from "@/features/endpoints/utils/http-method-colors";
import { messages } from "@/lib/i18n";

const TRAILING_SLASHES_PATTERN = /\/+$/;

type EndpointFormProps = {
  onAddBiller?: () => void;
  onSubmit: (data: EndpointFormData) => void;
  billers?: Biller[];
  isLoadingBillers?: boolean;
  initialBillerSlug?: string;
  initialMethod?: EndpointFormData["method"];
  initialUrl?: string;
  isBillerReadOnly?: boolean;
  children?: React.ReactNode;
};

function getDefaultValues(
  initialBillerSlug?: string,
  initialMethod: EndpointFormData["method"] = "GET",
  initialUrl = "/rest"
) {
  return {
    method: initialMethod,
    url: initialUrl,
    billerSlug: initialBillerSlug,
  };
}

function getBillerDescription(
  isLoadingBillers: boolean,
  isBillerReadOnly: boolean
) {
  if (isLoadingBillers) {
    return messages.endpoints.billersLoading;
  }

  if (isBillerReadOnly) {
    return messages.endpoints.billerReadOnlyDescription;
  }

  return messages.endpoints.billerDescription;
}

function getEndpointPreviewUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(TRAILING_SLASHES_PATTERN, "");
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return normalizedBaseUrl || "/";
  }

  if (!normalizedBaseUrl) {
    return normalizedPath;
  }

  return `${normalizedBaseUrl}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

export type EndpointFormHandle = {
  reset: () => void;
  getValues: () => EndpointFormData;
  form: UseFormReturn<EndpointFormData>;
};

function MethodCombobox({
  field,
  fieldState,
}: {
  readonly field: ControllerRenderProps<EndpointFormData, "method">;
  readonly fieldState: ControllerFieldState;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={fieldState.invalid}
          aria-label="Method"
          className="w-full justify-between"
          id="endpoint-method"
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className={getMethodTextColor(field.value)}>{field.value}</span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 opacity-50"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0"
        finalFocus={false}
        sideOffset={0}
      >
        <Command>
          <CommandInput
            aria-label="Search methods"
            className="h-11"
            placeholder="Search methods..."
          />
          <ScrollArea className="h-72 [&>[data-slot=scroll-area-scrollbar]]:opacity-100">
            <CommandList className="max-h-none overflow-visible p-1">
              <CommandEmpty>No method found.</CommandEmpty>
              <CommandGroup className="p-0">
                {httpMethods.map((method) => (
                  <CommandItem
                    className="min-h-10 px-3 py-2 text-[0.95rem]"
                    key={method}
                    onSelect={() => {
                      field.onChange(method);
                      setOpen(false);
                    }}
                    value={method}
                  >
                    <span className={getMethodTextColor(method)}>{method}</span>
                    <HugeiconsIcon
                      aria-hidden="true"
                      className={`ml-auto size-4 ${method === field.value ? "opacity-100" : "opacity-0"}`}
                      icon={Tick02Icon}
                      strokeWidth={2}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function BillerCombobox({
  billers,
  disabled,
  field,
  fieldState,
  onAddBiller,
}: {
  readonly billers: Biller[];
  readonly disabled: boolean;
  readonly field: ControllerRenderProps<EndpointFormData, "billerSlug">;
  readonly fieldState: ControllerFieldState;
  readonly onAddBiller?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedBiller = billers.find((biller) => biller.slug === field.value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={fieldState.invalid}
          aria-label="Biller"
          className="w-full justify-between"
          disabled={disabled}
          id="endpoint-biller"
          role="combobox"
          type="button"
          variant="outline"
        >
          <span
            className={selectedBiller ? "truncate" : "text-muted-foreground"}
          >
            {selectedBiller?.name ?? messages.endpoints.billerPlaceholder}
          </span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 opacity-50"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0"
        finalFocus={false}
        sideOffset={0}
      >
        <Command>
          <CommandInput
            aria-label="Search billers"
            className="h-11"
            placeholder="Search billers..."
          />
          <ScrollArea className="h-72 [&>[data-slot=scroll-area-scrollbar]]:opacity-100">
            <CommandList className="max-h-none overflow-visible p-1">
              <CommandEmpty>No biller found.</CommandEmpty>
              <CommandGroup className="p-0">
                {onAddBiller && (
                  <CommandItem
                    className="min-h-10 border-border/60 border-b px-3 py-2 text-[0.95rem] text-primary"
                    onSelect={() => {
                      setOpen(false);
                      onAddBiller();
                    }}
                    value={messages.billers.addNewBiller}
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                    <span>{messages.billers.addNewBiller}</span>
                  </CommandItem>
                )}
                {billers.map((biller) => (
                  <CommandItem
                    className="min-h-10 px-3 py-2 text-[0.95rem]"
                    key={biller.slug}
                    onSelect={() => {
                      field.onChange(biller.slug);
                      setOpen(false);
                    }}
                    value={`${biller.name} ${biller.slug}`}
                  >
                    <span className="truncate">{biller.name}</span>
                    <HugeiconsIcon
                      aria-hidden="true"
                      className={`ml-auto size-4 ${biller.slug === field.value ? "opacity-100" : "opacity-0"}`}
                      icon={Tick02Icon}
                      strokeWidth={2}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const EndpointForm = forwardRef<EndpointFormHandle, EndpointFormProps>(
  (
    {
      onSubmit,
      onAddBiller,
      billers = [],
      initialBillerSlug,
      initialMethod,
      initialUrl,
      isBillerReadOnly = false,
      isLoadingBillers = false,
      children,
    },
    ref
  ) => {
    const form = useForm<EndpointFormData>({
      resolver: zodResolver(endpointSchema),
      defaultValues: getDefaultValues(
        initialBillerSlug,
        initialMethod,
        initialUrl
      ),
    });

    useEffect(() => {
      form.reset(
        getDefaultValues(initialBillerSlug, initialMethod, initialUrl)
      );
    }, [form, initialBillerSlug, initialMethod, initialUrl]);

    useImperativeHandle(ref, () => ({
      reset: () => form.reset(),
      getValues: () => form.getValues(),
      form,
    }));

    const previewMethod = useWatch({ control: form.control, name: "method" });
    const previewPath = useWatch({ control: form.control, name: "url" });
    const previewUrl = getEndpointPreviewUrl(
      import.meta.env.VITE_ENDPOINT_URL || "",
      previewPath
    );

    const handleSubmit = (data: EndpointFormData) => {
      onSubmit(data);
    };

    return (
      <Form {...form}>
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <FieldGroup className="space-y-4">
              <Controller
                control={form.control}
                name="method"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endpoint-method">
                      {messages.endpoints.methodLabel}
                    </FieldLabel>
                    <FieldContent>
                      <MethodCombobox field={field} fieldState={fieldState} />
                      <FieldDescription>
                        {messages.endpoints.methodDescription}
                      </FieldDescription>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="url"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endpoint-url">
                      {messages.endpoints.urlLabel}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        id="endpoint-url"
                        placeholder={messages.endpoints.urlPlaceholder}
                      />
                      <FieldDescription>
                        {messages.endpoints.urlDescription}
                      </FieldDescription>
                      <div
                        aria-live="polite"
                        className="rounded-md border border-border/70 bg-muted/40 px-3 py-2"
                      >
                        <p className="mb-1 text-muted-foreground text-xs">
                          {messages.endpoints.urlPreviewLabel}
                        </p>
                        <code className="block break-all font-mono text-foreground text-sm">
                          {previewMethod} {previewUrl}
                        </code>
                      </div>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="billerSlug"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endpoint-biller">
                      {messages.endpoints.billerLabel}
                    </FieldLabel>
                    <FieldContent>
                      <BillerCombobox
                        billers={billers}
                        disabled={
                          isBillerReadOnly ||
                          isLoadingBillers ||
                          (billers.length === 0 && !onAddBiller)
                        }
                        field={field}
                        fieldState={fieldState}
                        onAddBiller={onAddBiller}
                      />
                      <FieldDescription>
                        {getBillerDescription(
                          isLoadingBillers,
                          isBillerReadOnly
                        )}
                      </FieldDescription>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          {children}
        </form>
      </Form>
    );
  }
);
