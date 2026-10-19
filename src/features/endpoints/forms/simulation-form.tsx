import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { useI18n } from "@/components/i18n-provider";
import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
} from "@/components/kibo-ui/choicebox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  DELAY_PRESETS,
  MAX_DELAY_MS,
  SIMULATION_TYPE,
  type SimulationFormValues,
  simulationFormSchema,
} from "@/features/endpoints/schemas/simulation-schema";

const MS_PER_SECOND = 1000;

type SimulationFormProps = {
  defaultValues?: SimulationFormValues;
  onSubmit: (data: SimulationFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  children?: React.ReactNode;
};

export type SimulationFormHandle = {
  reset: (values?: SimulationFormValues) => void;
  getValues: () => SimulationFormValues;
  form: UseFormReturn<SimulationFormValues>;
};

export const SimulationForm = forwardRef<
  SimulationFormHandle,
  SimulationFormProps
>(({ defaultValues, onSubmit, onCancel, isPending = false, children }, ref) => {
  const { messages } = useI18n();
  const form = useForm<SimulationFormValues>({
    defaultValues: defaultValues ?? { type: SIMULATION_TYPE.NONE },
    resolver: zodResolver(simulationFormSchema),
  });

  useImperativeHandle(ref, () => ({
    form,
    getValues: () => form.getValues(),
    reset: (values?: SimulationFormValues) => {
      form.reset(values ?? defaultValues ?? { type: SIMULATION_TYPE.NONE });
    },
  }));

  const simulationType = form.watch("type");
  const delayMs = form.watch("delayMs");

  const handleSubmit = (data: SimulationFormValues) => {
    // Validate delay if DELAY type is selected
    if (
      data.type === SIMULATION_TYPE.DELAY &&
      (!data.delayMs || data.delayMs <= 0)
    ) {
      form.setError("delayMs", {
        message: messages.endpoints.simulationDelayInvalidError,
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
          <FieldGroup size="compact">
            {/* Step 1: Simulation Type Selection */}
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="sr-only">
                    {messages.endpoints.simulationTypeLabel}
                  </FieldLabel>
                  <FieldContent>
                    <FieldDescription>
                      {messages.endpoints.simulationTypeDescription}
                    </FieldDescription>
                    <Choicebox
                      aria-label={messages.endpoints.simulationTypeLabel}
                      onValueChange={field.onChange}
                      size="sm"
                      value={field.value}
                    >
                      <ChoiceboxItem id="none" value={SIMULATION_TYPE.NONE}>
                        <img
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none size-16 shrink-0 object-contain sm:size-20"
                          height={80}
                          src="/brand/endpoint-behavior-normal.webp"
                          width={80}
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {messages.endpoints.simulationNormalTitle}
                            </span>
                          </div>
                          <p className="font-normal text-muted-foreground text-sm leading-relaxed">
                            {messages.endpoints.simulationNormalDescription}
                          </p>
                        </div>
                        <ChoiceboxIndicator className="shrink-0 self-center" />
                      </ChoiceboxItem>

                      <ChoiceboxItem id="delay" value={SIMULATION_TYPE.DELAY}>
                        <img
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none size-16 shrink-0 object-contain sm:size-20"
                          height={80}
                          src="/brand/endpoint-behavior-delay.webp"
                          width={80}
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {messages.endpoints.simulationDelayTitle}
                            </span>
                          </div>
                          <p className="font-normal text-muted-foreground text-sm leading-relaxed">
                            {messages.endpoints.simulationDelayDescription}
                          </p>
                        </div>
                        <ChoiceboxIndicator className="shrink-0 self-center" />
                      </ChoiceboxItem>

                      <ChoiceboxItem
                        id="timeout"
                        value={SIMULATION_TYPE.TIMEOUT}
                      >
                        <img
                          alt=""
                          aria-hidden="true"
                          className="pointer-events-none size-16 shrink-0 object-contain sm:size-20"
                          height={80}
                          src="/brand/endpoint-behavior-timeout.webp"
                          width={80}
                        />
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">
                              {messages.endpoints.simulationTimeoutTitle}
                            </span>
                          </div>
                          <p className="font-normal text-muted-foreground text-sm leading-relaxed">
                            {messages.endpoints.simulationTimeoutDescription}
                          </p>
                        </div>
                        <ChoiceboxIndicator className="shrink-0 self-center" />
                      </ChoiceboxItem>
                    </Choicebox>
                  </FieldContent>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Step 2: Delay Configuration (Conditional) */}
            <Collapsible open={simulationType === SIMULATION_TYPE.DELAY}>
              <CollapsibleContent>
                <div className="pb-1">
                  <Controller
                    control={form.control}
                    name="delayMs"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          {messages.endpoints.simulationDelayDuration}
                        </FieldLabel>
                        <FieldContent>
                          <FieldDescription>
                            {
                              messages.endpoints
                                .simulationDelayDurationDescription
                            }
                          </FieldDescription>

                          {/* Preset Buttons */}
                          <div className="flex flex-wrap gap-2">
                            {DELAY_PRESETS.map((preset) => (
                              <Button
                                aria-pressed={delayMs === preset.value}
                                key={preset.value}
                                onClick={() => field.onChange(preset.value)}
                                size="sm"
                                type="button"
                                variant={
                                  delayMs === preset.value
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {preset.label}
                              </Button>
                            ))}
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                            <div className="w-full space-y-2 sm:w-48">
                              <FieldLabel htmlFor="custom-delay">
                                {messages.endpoints.simulationCustomDelay}
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupInput
                                  aria-describedby="delay-preview"
                                  aria-invalid={fieldState.invalid}
                                  className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  id="custom-delay"
                                  inputMode="numeric"
                                  max={MAX_DELAY_MS}
                                  min={1}
                                  name={field.name}
                                  onBlur={field.onBlur}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    field.onChange(
                                      value === "" ? undefined : Number(value)
                                    );
                                  }}
                                  placeholder={
                                    messages.endpoints
                                      .simulationCustomDelayPlaceholder
                                  }
                                  ref={field.ref}
                                  type="number"
                                  value={field.value ?? ""}
                                />
                                <InputGroupAddon align="inline-end">
                                  <InputGroupText>ms</InputGroupText>
                                </InputGroupAddon>
                              </InputGroup>
                            </div>
                            <p
                              className="text-muted-foreground text-sm sm:pb-2"
                              id="delay-preview"
                            >
                              {delayMs !== undefined && delayMs > 0 ? (
                                <>
                                  {messages.endpoints.simulationPreviewPrefix}{" "}
                                  <span className="font-medium text-foreground tabular-nums">
                                    {delayMs >= MS_PER_SECOND
                                      ? `${delayMs / MS_PER_SECOND}s`
                                      : `${delayMs}ms`}
                                  </span>
                                </>
                              ) : (
                                messages.endpoints
                                  .simulationCustomDelayPlaceholder
                              )}
                            </p>
                          </div>
                        </FieldContent>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </FieldGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 justify-end gap-2 border-t bg-muted/20 px-5 py-4 sm:px-6">
          {onCancel && (
            <Button onClick={onCancel} type="button" variant="outline">
              {messages.common.cancel}
            </Button>
          )}
          <Button
            disabled={
              !simulationType ||
              isPending ||
              (simulationType === SIMULATION_TYPE.DELAY &&
                (!delayMs || delayMs <= 0))
            }
            type="submit"
          >
            {isPending ? messages.common.applying : messages.common.apply}
          </Button>
        </div>

        {children}
      </form>
    </Form>
  );
});

SimulationForm.displayName = "SimulationForm";
