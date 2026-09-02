import { motion } from "motion/react";
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
        <span className="inline-flex select-none items-center rounded-xl border-2 border-rose-500/40 border-b-[3px] bg-rose-500/15 px-2 py-0.5 font-black text-rose-600 text-xs dark:border-rose-500/50 dark:border-b-rose-400 dark:bg-rose-500/20 dark:text-rose-300">
          Timeout
        </span>
      )}
      {mode === SIMULATION_MODE.DELAY && (
        <span className="inline-flex select-none items-center rounded-xl border-2 border-amber-500/40 border-b-[3px] bg-amber-500/15 px-2 py-0.5 font-bold text-amber-700 text-xs dark:border-amber-500/50 dark:border-b-amber-400 dark:bg-amber-500/20 dark:text-amber-300">
          Delay: {formatDelayValue(response.delayMs ?? 0)}
        </span>
      )}
      {mode === SIMULATION_MODE.NORMAL && (
        <span className="inline-flex select-none items-center rounded-xl border-2 border-border/80 border-b-[3px] bg-muted/40 px-2 py-0.5 font-bold text-muted-foreground text-xs">
          Normal
        </span>
      )}
    </motion.div>
  );
}
