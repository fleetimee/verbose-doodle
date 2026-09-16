import { motion } from "motion/react";
import { useI18n } from "@/components/i18n-provider";
import type { EndpointResponse } from "@/features/endpoints/types";
import {
  formatDelayValue,
  getSimulationMode,
  SIMULATION_MODE,
} from "@/features/endpoints/utils/simulation-helpers";
import { formatMessage } from "@/lib/i18n";
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
  const { messages } = useI18n();
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
        <span className="inline-flex select-none items-center rounded-xl border-2 border-rose-500/40 border-b-2 bg-rose-500/15 px-2 py-0.5 font-black text-rose-600 text-xs dark:border-rose-500/50 dark:border-b-rose-400 dark:bg-rose-500/20 dark:text-rose-300">
          {messages.endpoints.simulationBadgeTimeout}
        </span>
      )}
      {mode === SIMULATION_MODE.DELAY && (
        <span className="inline-flex select-none items-center rounded-xl border-2 border-amber-500/40 border-b-2 bg-amber-500/15 px-2 py-0.5 font-bold text-amber-700 text-xs dark:border-amber-500/50 dark:border-b-amber-400 dark:bg-amber-500/20 dark:text-amber-300">
          {formatMessage(messages.endpoints.simulationBadgeDelay, {
            delay: formatDelayValue(response.delayMs ?? 0),
          })}
        </span>
      )}
      {mode === SIMULATION_MODE.NORMAL && (
        <span className="inline-flex select-none items-center rounded-xl border-2 border-border/80 border-b-2 bg-muted/40 px-2 py-0.5 font-bold text-muted-foreground text-xs">
          {messages.endpoints.simulationBadgeNormal}
        </span>
      )}
    </motion.div>
  );
}
