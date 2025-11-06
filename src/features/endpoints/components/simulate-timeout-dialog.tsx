import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SimulationFormHandle } from "@/features/endpoints/forms/simulation-form";
import { SimulationForm } from "@/features/endpoints/forms/simulation-form";
import { useUpdateResponseSimulation } from "@/features/endpoints/hooks/use-update-response-simulation";
import {
  SIMULATION_TYPE,
  type SimulationFormValues,
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
  const formRef = useRef<SimulationFormHandle>(null);
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

  // Reset form when dialog opens or response simulation settings change
  useEffect(() => {
    if (open && formRef.current) {
      let initialValues: SimulationFormValues;

      if (response.simulateTimeout) {
        initialValues = { type: SIMULATION_TYPE.TIMEOUT };
      } else if (response.delayMs && response.delayMs > 0) {
        initialValues = {
          type: SIMULATION_TYPE.DELAY,
          delayMs: response.delayMs,
        };
      } else {
        initialValues = { type: SIMULATION_TYPE.NONE };
      }

      formRef.current.reset(initialValues);
    }
  }, [open, response.simulateTimeout, response.delayMs]);

  const handleSubmit = (values: SimulationFormValues) => {
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
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
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

        <SimulationForm
          defaultValues={getInitialValues()}
          isPending={isPending}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          ref={formRef}
        />
      </DialogContent>
    </Dialog>
  );
}
