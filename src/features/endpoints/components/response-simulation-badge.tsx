import { Badge } from "@/components/ui/badge";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  formatDelayValue,
  getSimulationMode,
  SIMULATION_MODE,
} from "@/features/endpoints/utils/simulation-helpers";

type ResponseSimulationBadgeProps = {
  response: EndpointResponse;
};

/**
 * Displays the simulation mode badge for a response
 * Shows one of three states: Timeout, Delay, or Normal
 */
export function ResponseSimulationBadge({
  response,
}: ResponseSimulationBadgeProps) {
  const mode = getSimulationMode(response);

  switch (mode) {
    case SIMULATION_MODE.TIMEOUT:
      return (
        <Badge className="text-xs" variant="destructive">
          Timeout
        </Badge>
      );

    case SIMULATION_MODE.DELAY:
      return (
        <Badge className="text-xs" variant="secondary">
          Delay: {formatDelayValue(response.delayMs ?? 0)}
        </Badge>
      );

    default:
      return (
        <Badge className="text-xs" variant="outline">
          Normal
        </Badge>
      );
  }
}
