import { Clock01Icon, Clock03Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  formatDelayValue,
  getSimulationMode,
  SIMULATION_MODE,
} from "@/features/endpoints/utils/simulation-helpers";

type ResponseSimulationAlertProps = {
  response: EndpointResponse;
};

/**
 * Displays an informative alert explaining what will happen
 * when the endpoint is called based on the simulation settings
 */
export function ResponseSimulationAlert({
  response,
}: ResponseSimulationAlertProps) {
  const mode = getSimulationMode(response);

  switch (mode) {
    case SIMULATION_MODE.TIMEOUT:
      return (
        <Alert variant="destructive">
          <HugeiconsIcon
            className="h-4 w-4"
            icon={Clock03Icon}
            strokeWidth={2}
          />
          <AlertTitle>Timeout Simulation Active</AlertTitle>
          <AlertDescription>
            When this endpoint is called, the server will hold the connection
            indefinitely without sending a response. The client will eventually
            timeout based on their configured timeout settings. This is useful
            for testing timeout handling and error recovery logic.
          </AlertDescription>
        </Alert>
      );

    case SIMULATION_MODE.DELAY:
      return (
        <Alert>
          <HugeiconsIcon
            className="h-4 w-4"
            icon={Clock01Icon}
            strokeWidth={2}
          />
          <AlertTitle>Latency Simulation Active</AlertTitle>
          <AlertDescription>
            When this endpoint is called, the server will wait for{" "}
            <span className="font-semibold">
              {formatDelayValue(response.delayMs ?? 0)}
            </span>{" "}
            before sending the response. This simulates slow network conditions
            and is useful for testing loading states, spinners, and user
            experience under poor network conditions.
          </AlertDescription>
        </Alert>
      );

    default:
      return (
        <Alert>
          <HugeiconsIcon className="h-4 w-4" icon={ZapIcon} strokeWidth={2} />
          <AlertTitle>Normal Response Mode</AlertTitle>
          <AlertDescription>
            When this endpoint is called, the server will respond immediately
            with the JSON payload shown below. No delays or timeouts are
            simulated. This is the standard behavior for testing normal
            application flows.
          </AlertDescription>
        </Alert>
      );
  }
}
