import { AnimatePresence, motion } from "motion/react";
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

const BADGE_ANIMATION_DURATION = 0.2;

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
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        key={`${mode}-${response.delayMs ?? 0}`}
        transition={{
          duration: BADGE_ANIMATION_DURATION,
          ease: "easeOut",
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
        {mode === SIMULATION_MODE.NONE && (
          <Badge className="text-xs" variant="outline">
            Normal
          </Badge>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
