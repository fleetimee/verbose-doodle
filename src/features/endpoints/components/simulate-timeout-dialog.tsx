import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Timer, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Constants
const DIALOG_CLOSE_DELAY_MS = 150;
const MS_PER_SECOND = 1000;
const DELAY_DISPLAY_DECIMAL_PLACES = 2;

import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
} from "@/components/kibo-ui/choicebox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperTitle,
} from "@/components/ui/stepper";
import { useUpdateResponseSimulation } from "@/features/endpoints/hooks/use-update-response-simulation";
import {
  DELAY_PRESETS,
  MAX_DELAY_MS,
  SIMULATION_TYPE,
  type SimulationFormValues,
  simulationFormSchema,
} from "@/features/endpoints/schemas/simulation-schema";
import type { EndpointResponse } from "@/features/endpoints/types";

type SimulateTimeoutDialogProps = {
  response: EndpointResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SimulateTimeoutDialog({
  response,
  open,
  onOpenChange,
}: SimulateTimeoutDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { mutate: updateSimulation, isPending } = useUpdateResponseSimulation();

  // Determine initial values based on current response settings
  const getInitialValues = (): SimulationFormValues => {
    if (response.simulateTimeout) {
      return { type: SIMULATION_TYPE.TIMEOUT };
    }
    if (response.delayMs && response.delayMs > 0) {
      return { type: SIMULATION_TYPE.DELAY, delayMs: response.delayMs };
    }
    return { type: SIMULATION_TYPE.NONE };
  };

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: getInitialValues(),
  });

  const simulationType = form.watch("type");
  const delayMs = form.watch("delayMs");

  const handleNext = () => {
    if (simulationType === SIMULATION_TYPE.DELAY) {
      setCurrentStep(2);
    } else {
      // For NONE or TIMEOUT, submit directly
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    const values = form.getValues();

    // Validate delay if DELAY type is selected
    if (
      values.type === SIMULATION_TYPE.DELAY &&
      (!values.delayMs || values.delayMs <= 0)
    ) {
      form.setError("delayMs", {
        message: "Please enter a valid delay value",
      });
      return;
    }

    // Convert form values to API request
    const simulationSettings = {
      responseId: response.id,
      delayMs:
        values.type === SIMULATION_TYPE.DELAY && values.delayMs
          ? values.delayMs
          : 0,
      simulateTimeout: values.type === SIMULATION_TYPE.TIMEOUT,
    };

    updateSimulation(simulationSettings, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form and step
        form.reset(getInitialValues());
        setCurrentStep(1);
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form and step when closing
    setTimeout(() => {
      form.reset(getInitialValues());
      setCurrentStep(1);
    }, DIALOG_CLOSE_DELAY_MS); // Small delay to avoid visual glitch during close animation
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Simulate Response Behavior</DialogTitle>
          <DialogDescription>
            Configure network simulation for "{response.name}"
          </DialogDescription>
        </DialogHeader>

        <Stepper
          className="gap-6"
          onValueChange={setCurrentStep}
          value={currentStep}
        >
          {/* Step 1: Choose Simulation Type */}
          <StepperItem step={1}>
            <StepperTitle className="sr-only">
              Choose Simulation Type
            </StepperTitle>
            <StepperContent value={1}>
              <Field>
                <FieldLabel className="sr-only">Simulation Type</FieldLabel>
                <FieldDescription>
                  Select how you want to simulate the response behavior
                </FieldDescription>
                <Choicebox
                  className="gap-4"
                  onValueChange={(value) => {
                    form.setValue(
                      "type",
                      value as SimulationFormValues["type"]
                    );
                  }}
                  value={simulationType}
                >
                  <ChoiceboxItem
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    id="none"
                    value={SIMULATION_TYPE.NONE}
                  >
                    <ChoiceboxIndicator className="sr-only" />
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      <Zap className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">
                          Normal Response
                        </span>
                        <span className="text-muted-foreground text-xs">
                          No simulation
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Return the response immediately without any delay or
                        timeout simulation. Best for normal testing scenarios.
                      </p>
                    </div>
                  </ChoiceboxItem>

                  <ChoiceboxItem
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    id="delay"
                    value={SIMULATION_TYPE.DELAY}
                  >
                    <ChoiceboxIndicator className="sr-only" />
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      <Clock className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">
                          Latency Simulation
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Add response delay
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Add a configurable delay before sending the response.
                        Useful for testing slow network conditions and loading
                        states.
                      </p>
                    </div>
                  </ChoiceboxItem>

                  <ChoiceboxItem
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    id="timeout"
                    value={SIMULATION_TYPE.TIMEOUT}
                  >
                    <ChoiceboxIndicator className="sr-only" />
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                      <Timer className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">
                          Timeout Simulation
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Never respond
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Hold the connection indefinitely without sending any
                        response. Client will timeout based on their timeout
                        settings. Perfect for testing timeout handling.
                      </p>
                    </div>
                  </ChoiceboxItem>
                </Choicebox>
              </Field>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={handleClose} type="button" variant="outline">
                  Cancel
                </Button>
                <Button
                  disabled={!simulationType || isPending}
                  onClick={handleNext}
                  type="button"
                >
                  {simulationType === SIMULATION_TYPE.DELAY ? "Next" : "Apply"}
                </Button>
              </div>
            </StepperContent>
          </StepperItem>

          {/* Step 2: Configure Delay */}
          <StepperItem step={2}>
            <StepperTitle className="sr-only">Configure Delay</StepperTitle>
            <StepperContent value={2}>
              <div className="space-y-6">
                <Field>
                  <FieldLabel>Delay Duration</FieldLabel>
                  <FieldDescription>
                    Choose a preset or enter a custom delay value
                  </FieldDescription>
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {DELAY_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        onClick={() => form.setValue("delayMs", preset.value)}
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
                            form.setValue("delayMs", value);
                          }
                        }}
                        placeholder="Enter delay in ms"
                        type="number"
                        value={delayMs || ""}
                      />
                    </div>
                    <div className="text-muted-foreground text-sm">ms</div>
                  </div>
                  {form.formState.errors.delayMs && (
                    <p className="mt-2 text-destructive text-sm">
                      {form.formState.errors.delayMs.message}
                    </p>
                  )}
                </Field>

                {delayMs && delayMs > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
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
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button onClick={handleBack} type="button" variant="outline">
                  Back
                </Button>
                <Button
                  disabled={!delayMs || delayMs <= 0 || isPending}
                  onClick={handleSubmit}
                  type="button"
                >
                  {isPending ? "Applying..." : "Apply"}
                </Button>
              </div>
            </StepperContent>
          </StepperItem>
        </Stepper>
      </DialogContent>
    </Dialog>
  );
}
