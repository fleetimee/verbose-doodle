import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Timer, Zap } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
} from "@/components/kibo-ui/choicebox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DELAY_PRESETS,
  MAX_DELAY_MS,
  SIMULATION_TYPE,
  type SimulationFormValues,
  simulationFormSchema,
} from "@/features/endpoints/schemas/simulation-schema";

const MS_PER_SECOND = 1000;
const DELAY_DISPLAY_DECIMAL_PLACES = 2;

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
  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: defaultValues ?? { type: SIMULATION_TYPE.NONE },
  });

  useImperativeHandle(ref, () => ({
    reset: (values?: SimulationFormValues) => {
      form.reset(values ?? defaultValues ?? { type: SIMULATION_TYPE.NONE });
    },
    getValues: () => form.getValues(),
    form,
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
        message: "Please enter a valid delay value",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex-1 space-y-6 overflow-y-auto">
          <FieldGroup className="space-y-6">
            {/* Step 1: Simulation Type Selection */}
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="sr-only">Simulation Type</FieldLabel>
                  <FieldContent>
                    <FieldDescription>
                      Select how you want to simulate the response behavior
                    </FieldDescription>
                    <Choicebox
                      className="gap-4"
                      onValueChange={(value) => {
                        field.onChange(value as SimulationFormValues["type"]);
                      }}
                      value={field.value}
                    >
                      <ChoiceboxItem
                        className="transition-colors hover:bg-accent/50"
                        id="none"
                        value={SIMULATION_TYPE.NONE}
                      >
                        <ChoiceboxIndicator className="sr-only" />
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                          <Zap className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              Normal Response
                            </span>
                            <Badge variant="secondary">No simulation</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Return the response immediately without any delay or
                            timeout simulation. Best for normal testing
                            scenarios.
                          </p>
                        </div>
                      </ChoiceboxItem>

                      <ChoiceboxItem
                        className="transition-colors hover:bg-accent/50"
                        id="delay"
                        value={SIMULATION_TYPE.DELAY}
                      >
                        <ChoiceboxIndicator className="sr-only" />
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                          <Clock className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              Latency Simulation
                            </span>
                            <Badge variant="secondary">
                              Add response delay
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Add a configurable delay before sending the
                            response. Useful for testing slow network conditions
                            and loading states.
                          </p>
                        </div>
                      </ChoiceboxItem>

                      <ChoiceboxItem
                        className="transition-colors hover:bg-accent/50"
                        id="timeout"
                        value={SIMULATION_TYPE.TIMEOUT}
                      >
                        <ChoiceboxIndicator className="sr-only" />
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                          <Timer className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              Timeout Simulation
                            </span>
                            <Badge variant="secondary">Never respond</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Hold the connection indefinitely without sending any
                            response. Client will timeout based on their timeout
                            settings. Perfect for testing timeout handling.
                          </p>
                        </div>
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
            {simulationType === SIMULATION_TYPE.DELAY && (
              <Controller
                control={form.control}
                name="delayMs"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Delay Duration</FieldLabel>
                    <FieldContent>
                      <FieldDescription>
                        Choose a preset or enter a custom delay value
                      </FieldDescription>

                      {/* Preset Buttons */}
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {DELAY_PRESETS.map((preset) => (
                          <Button
                            key={preset.value}
                            onClick={() => field.onChange(preset.value)}
                            size="sm"
                            type="button"
                            variant={
                              delayMs === preset.value ? "default" : "outline"
                            }
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>

                      {/* Custom Delay Input */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FieldLabel htmlFor="custom-delay">
                            Custom Delay
                          </FieldLabel>
                          <Input
                            id="custom-delay"
                            max={MAX_DELAY_MS}
                            min={0}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value, 10);
                              if (!Number.isNaN(value)) {
                                field.onChange(value);
                              }
                            }}
                            placeholder="Enter delay in ms"
                            type="number"
                            value={field.value || ""}
                          />
                        </div>
                        <div className="text-muted-foreground text-sm">ms</div>
                      </div>

                      {/* Preview */}
                      {delayMs && delayMs > 0 && (
                        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                          <p className="font-medium text-sm">Preview</p>
                          <p className="mt-1 text-muted-foreground text-sm">
                            Response will be delayed by{" "}
                            <span className="font-semibold">
                              {delayMs >= MS_PER_SECOND
                                ? `${(delayMs / MS_PER_SECOND).toFixed(
                                    DELAY_DISPLAY_DECIMAL_PLACES
                                  )}s`
                                : `${delayMs}ms`}
                            </span>
                          </p>
                        </div>
                      )}
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button onClick={onCancel} type="button" variant="outline">
              Cancel
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
            {isPending ? "Applying..." : "Apply"}
          </Button>
        </div>

        {children}
      </form>
    </Form>
  );
});

SimulationForm.displayName = "SimulationForm";
