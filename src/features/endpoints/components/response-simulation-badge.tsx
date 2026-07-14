import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  formatDelayValue,
  getSimulationMode,
  SIMULATION_MODE,
} from "@/features/endpoints/utils/simulation-helpers";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

type ResponseSimulationBadgeProps = {
  response: EndpointResponse;
};

/**
 * Displays the simulation mode badge for a response
 * Shows one of three states: Timeout, Delay, or Normal
 * With smooth animations when the mode changes
 */
export function ResponseSimulationBadge({
  response,
}: ResponseSimulationBadgeProps) {
  const mode = getSimulationMode(response);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      key={`${mode}-${response.delayMs ?? 0}`}
      transition={{
        duration: MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
      }}
    >
      {mode === SIMULATION_MODE.TIMEOUT && (
        <Badge className="text-xs" variant="destructive">
          Timeout
        </Badge>
      )}
      {mode === SIMULATION_MODE.DELAY && (
        <Badge className="text-xs" variant="secondary">
          Delay: {formatDelayValue(response.delayMs ?? 0)}
        </Badge>
      )}
      {mode === SIMULATION_MODE.NORMAL && (
        <Badge className="text-xs" variant="outline">
          Normal
        </Badge>
      )}
    </motion.div>
  );
}
