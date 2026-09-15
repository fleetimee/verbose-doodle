import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
  useForm,
  useWatch,
} from "react-hook-form";
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
import { Spinner } from "@/components/ui/spinner";
import type { Biller } from "@/features/billers/types";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import type {
  EndpointAvailability,
  EndpointAvailabilityInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import {
  type EndpointFormData,
  endpointSchema,
  httpMethods,
} from "@/features/endpoints/schemas/endpoint-schema";
import { getMethodTextColor } from "@/features/endpoints/utils/http-method-colors";
import { formatMessage, messages } from "@/lib/i18n";

const TRAILING_SLASHES_PATTERN = /\/+$/;
const AVAILABILITY_DEBOUNCE_MS = 400;

type EndpointFormProps = {
  onAddBiller?: () => void;
  onSubmit: (data: EndpointFormData) => void;
  billers?: Biller[];
  isLoadingBillers?: boolean;
  initialBillerSlug?: string;
  initialMethod?: EndpointFormData["method"];
  initialUrl?: string;
  isBillerReadOnly?: boolean;
  checkEndpointAvailability?: (
    input: EndpointAvailabilityInput
  ) => Promise<EndpointAvailability>;
  availabilityExcludeSlug?: string;
  onDisableConflictingEndpoint?: (endpointSlug: string) => Promise<unknown>;
  children?: React.ReactNode;
};

function getDefaultValues(
  initialBillerSlug?: string,
  initialMethod: EndpointFormData["method"] = "GET",
  initialUrl = "/rest"
) {
  return {
    billerSlug: initialBillerSlug,
    method: initialMethod,
    url: initialUrl,
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
  field: ControllerRenderProps<EndpointFormData, "method">;
  fieldState: ControllerFieldState;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={fieldState.invalid}
          className="w-full justify-between"
          id="endpoint-method"
          ref={triggerRef}
          role="combobox"
          variant="outline"
        >
          {field.value ? (
            <HttpMethodBadge method={field.value} />
          ) : (
            messages.endpoints.methodPlaceholder
          )}
          <HugeiconsIcon
            className="size-4 shrink-0 opacity-50"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--anchor-width)] overflow-hidden"
        finalFocus={false}
        portalContainer={
          triggerRef.current?.closest<HTMLElement>(
            "[data-slot=drawer-content]"
          ) ?? undefined
        }
        sideOffset={0}
        size="none"
      >
        <Command>
          <CommandInput
            aria-label={messages.endpoints.searchMethodsAria}
            className="h-11"
            placeholder={messages.endpoints.searchMethodsPlaceholder}
          />
          <ScrollArea className="h-72" variant="visible">
            <CommandList variant="scrollable">
              <CommandEmpty>{messages.endpoints.noMethodsFound}</CommandEmpty>
              <CommandGroup variant="flush">
                {httpMethods.map((method) => (
                  <CommandItem
                    key={method}
                    onSelect={() => {
                      field.onChange(method);
                      setOpen(false);
                    }}
                    value={method}
                    variant="nav"
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedBiller = billers.find((biller) => biller.slug === field.value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={fieldState.invalid}
          aria-label={messages.endpoints.billerLabel}
          className="w-full justify-between"
          disabled={disabled}
          id="endpoint-biller"
          ref={triggerRef}
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
        className="w-[var(--anchor-width)] overflow-hidden"
        finalFocus={false}
        portalContainer={
          triggerRef.current?.closest<HTMLElement>(
            "[data-slot=drawer-content]"
          ) ?? undefined
        }
        sideOffset={0}
        size="none"
      >
        <Command>
          <CommandInput
            aria-label={messages.billers.searchAria}
            className="h-11"
            placeholder={messages.billers.searchPlaceholder}
          />
          <ScrollArea className="h-72" variant="visible">
            <CommandList variant="scrollable">
              <CommandEmpty>{messages.billers.noBillersFound}</CommandEmpty>
              <CommandGroup variant="flush">
                {onAddBiller && (
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onAddBiller();
                    }}
                    value={messages.billers.addNewBiller}
                    variant="action"
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                    <span>{messages.billers.addNewBiller}</span>
                  </CommandItem>
                )}
                {billers.map((biller) => (
                  <CommandItem
                    key={biller.slug}
                    onSelect={() => {
                      field.onChange(biller.slug);
                      setOpen(false);
                    }}
                    value={`${biller.name} ${biller.slug}`}
                    variant="nav"
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
      checkEndpointAvailability,
      availabilityExcludeSlug,
      onDisableConflictingEndpoint,
      children,
    },
    ref
  ) => {
    const form = useForm<EndpointFormData>({
      defaultValues: getDefaultValues(
        initialBillerSlug,
        initialMethod,
        initialUrl
      ),
      mode: "onChange",
      reValidateMode: "onChange",
      resolver: zodResolver(endpointSchema),
    });
    const [availability, setAvailability] = useState<
      | { status: "idle" | "checking" | "error" }
      | ({ status: "complete" } & EndpointAvailability)
    >({ status: "idle" });
    const [availabilityRevision, setAvailabilityRevision] = useState(0);
    const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);
    const [isDisablingConflict, setIsDisablingConflict] = useState(false);

    useEffect(() => {
      form.reset(
        getDefaultValues(initialBillerSlug, initialMethod, initialUrl)
      );
    }, [form, initialBillerSlug, initialMethod, initialUrl]);

    useImperativeHandle(ref, () => ({
      form,
      getValues: () => form.getValues(),
      reset: () => form.reset(),
    }));

    const previewMethod = useWatch({ control: form.control, name: "method" });
    const previewPath = useWatch({ control: form.control, name: "url" });
    const previewUrl = getEndpointPreviewUrl(
      import.meta.env.VITE_ENDPOINT_URL || "",
      previewPath
    );
    const hasValidPreviewPath =
      endpointSchema.shape.url.safeParse(previewPath).success;
    const conflictOwner =
      availability.status === "complete"
        ? availability.billerName || availability.billerSlug
        : undefined;
    const conflictMessage =
      availability.status === "complete" && !availability.available
        ? formatMessage(messages.endpoints.endpointConflictUsedBy, {
            method: previewMethod,
            owner: conflictOwner ?? "",
            path: previewPath,
          })
        : undefined;

    useEffect(() => {
      if (!(checkEndpointAvailability && hasValidPreviewPath)) {
        setAvailability({ status: "idle" });
        return;
      }

      let active = true;
      setAvailability({ status: "checking" });
      const timeoutId = window.setTimeout(() => {
        checkEndpointAvailability({
          excludeSlug: availabilityExcludeSlug,
          method: previewMethod,
          url: previewPath,
        })
          .then((result) => {
            if (active) {
              setAvailability({ ...result, status: "complete" });
            }
          })
          .catch(() => {
            if (active) {
              setAvailability({ status: "error" });
            }
          });
      }, AVAILABILITY_DEBOUNCE_MS);

      return () => {
        active = false;
        window.clearTimeout(timeoutId);
      };
    }, [
      availabilityRevision,
      availabilityExcludeSlug,
      checkEndpointAvailability,
      hasValidPreviewPath,
      previewMethod,
      previewPath,
    ]);

    useEffect(() => {
      const currentError = form.getFieldState("url").error;

      if (conflictMessage) {
        form.setError("url", { message: conflictMessage, type: "duplicate" });
      } else if (currentError?.type === "duplicate") {
        form.clearErrors("url");
      }
    }, [conflictMessage, form]);

    const handleSubmit = (data: EndpointFormData) => {
      if (conflictMessage) {
        form.setError("url", { message: conflictMessage, type: "duplicate" });
        return;
      }

      onSubmit(data);
    };

    const handleDisableConflict = async () => {
      if (
        availability.status !== "complete" ||
        !availability.endpointSlug ||
        !onDisableConflictingEndpoint
      ) {
        return;
      }

      setIsDisablingConflict(true);
      try {
        await onDisableConflictingEndpoint(availability.endpointSlug);
        setIsDisableConfirmOpen(false);
        setAvailabilityRevision((revision) => revision + 1);
      } finally {
        setIsDisablingConflict(false);
      }
    };

    return (
      <Form {...form}>
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <FieldGroup size="compact">
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
                  <Field data-invalid={fieldState.invalid || !!conflictMessage}>
                    <FieldLabel htmlFor="endpoint-url">
                      {messages.endpoints.urlLabel}
                    </FieldLabel>
                    <FieldContent variant="foreground">
                      <Input
                        {...field}
                        aria-describedby={
                          conflictMessage
                            ? "endpoint-url-conflict"
                            : "endpoint-url-description"
                        }
                        aria-invalid={fieldState.invalid || !!conflictMessage}
                        autoComplete="off"
                        id="endpoint-url"
                        placeholder={messages.endpoints.urlPlaceholder}
                      />
                      {!conflictMessage && (
                        <FieldDescription id="endpoint-url-description">
                          {messages.endpoints.urlDescription}
                        </FieldDescription>
                      )}
                      {availability.status === "checking" && (
                        <div
                          aria-live="polite"
                          className="flex items-start gap-2 text-muted-foreground text-sm"
                          role="status"
                        >
                          <HugeiconsIcon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 animate-spin"
                            icon={Loading03Icon}
                            strokeWidth={2}
                          />
                          <span>
                            {messages.endpoints.endpointCheckingAvailability}
                          </span>
                        </div>
                      )}
                      {availability.status === "complete" &&
                        availability.available && (
                          <div
                            aria-live="polite"
                            className="flex items-start gap-2 text-primary text-sm"
                            role="status"
                          >
                            <HugeiconsIcon
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0"
                              icon={CheckmarkCircle02Icon}
                              strokeWidth={2}
                            />
                            <span>
                              {formatMessage(
                                messages.endpoints.endpointAvailable,
                                {
                                  method: previewMethod,
                                  path: previewPath,
                                }
                              )}
                            </span>
                          </div>
                        )}
                      {availability.status === "error" && (
                        <div
                          aria-live="polite"
                          className="flex items-start gap-2 text-muted-foreground text-sm"
                          role="status"
                        >
                          <HugeiconsIcon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0"
                            icon={AlertCircleIcon}
                            strokeWidth={2}
                          />
                          <span>
                            {messages.endpoints.endpointAvailabilityFailed}
                          </span>
                        </div>
                      )}
                      {conflictMessage && (
                        <div
                          className="my-1 rounded-lg border border-destructive/25 bg-destructive/5 p-3"
                          id="endpoint-url-conflict"
                          role="alert"
                        >
                          <div className="flex items-start gap-2.5">
                            <HugeiconsIcon
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-destructive"
                              icon={AlertCircleIcon}
                              strokeWidth={2}
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-medium text-sm">
                                {messages.endpoints.conflictTitle}
                              </p>
                              <p className="break-words text-muted-foreground text-sm leading-relaxed">
                                {conflictMessage}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-3 border-destructive/15 border-t pt-3">
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {availability.status === "complete" &&
                              availability.endpointSlug &&
                              onDisableConflictingEndpoint
                                ? messages.endpoints.conflictResolution
                                : messages.endpoints.conflictResolutionReadOnly}
                            </p>
                            {availability.status === "complete" &&
                              availability.endpointSlug &&
                              onDisableConflictingEndpoint && (
                                <Button
                                  className="h-auto min-h-8 w-fit max-w-full whitespace-normal"
                                  disabled={isDisablingConflict}
                                  onClick={() => setIsDisableConfirmOpen(true)}
                                  size="sm"
                                  type="button"
                                  variant="destructive-subtle"
                                >
                                  {isDisablingConflict && <Spinner />}
                                  {messages.endpoints.disableExistingEndpoint}
                                </Button>
                              )}
                          </div>
                        </div>
                      )}
                      <div
                        aria-live="polite"
                        className="rounded-md border border-border/70 bg-muted/40 px-3 py-2"
                      >
                        <p className="mb-1 text-muted-foreground text-xs">
                          {messages.endpoints.urlPreviewLabel}
                        </p>
                        <code className="block break-all font-mono text-foreground text-sm">
                          {hasValidPreviewPath
                            ? `${previewMethod} ${previewUrl}`
                            : messages.endpoints.urlPreviewInvalid}
                        </code>
                      </div>
                    </FieldContent>
                    {fieldState.invalid &&
                      fieldState.error?.type !== "duplicate" && (
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
        <AlertDialog
          onOpenChange={setIsDisableConfirmOpen}
          open={isDisableConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Disable the existing endpoint?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {previewMethod} {previewPath} currently belongs to{" "}
                {conflictOwner}. Simulator requests will return 404 until
                another endpoint is enabled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDisablingConflict}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDisablingConflict}
                onClick={handleDisableConflict}
                variant="destructive"
              >
                {isDisablingConflict && <Spinner className="mr-2" />}
                Disable endpoint
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Form>
    );
  }
);
