import { Clock01Icon, Clock03Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useI18n } from "@/components/i18n-provider";
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
  const { messages } = useI18n();
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
          <AlertTitle>
            {messages.endpoints.simulationTimeoutAlertTitle}
          </AlertTitle>
          <AlertDescription>
            {messages.endpoints.simulationTimeoutAlertDescription}
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
          <AlertTitle>
            {messages.endpoints.simulationDelayAlertTitle}
          </AlertTitle>
          <AlertDescription>
            {messages.endpoints.simulationDelayAlertPrefix}
            <span className="font-semibold">
              {formatDelayValue(response.delayMs ?? 0)}
            </span>
            {messages.endpoints.simulationDelayAlertSuffix}
          </AlertDescription>
        </Alert>
      );

    default:
      return (
        <Alert>
          <HugeiconsIcon className="h-4 w-4" icon={ZapIcon} strokeWidth={2} />
          <AlertTitle>
            {messages.endpoints.simulationNormalAlertTitle}
          </AlertTitle>
          <AlertDescription>
            {messages.endpoints.simulationNormalAlertDescription}
          </AlertDescription>
        </Alert>
      );
  }
}
