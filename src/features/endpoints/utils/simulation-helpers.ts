import type { EndpointResponse } from "@/features/endpoints/types";

/**
 * Simulation mode types
 */
export const SIMULATION_MODE = {
  TIMEOUT: "timeout",
  DELAY: "delay",
  NORMAL: "normal",
} as const;

export type SimulationMode =
  (typeof SIMULATION_MODE)[keyof typeof SIMULATION_MODE];

/**
 * Determines the current simulation mode of a response
 * Priority: Timeout > Delay > Normal
 */
export function getSimulationMode(response: EndpointResponse): SimulationMode {
  if (response.simulateTimeout) {
    return SIMULATION_MODE.TIMEOUT;
  }

  if (response.delayMs && response.delayMs > 0) {
    return SIMULATION_MODE.DELAY;
  }

  return SIMULATION_MODE.NORMAL;
}

/**
 * Format delay value for display
 */
export function formatDelayValue(delayMs: number): string {
  const MS_PER_SECOND = 1000;
  const DELAY_DISPLAY_DECIMAL_PLACES = 1;

  if (delayMs >= MS_PER_SECOND) {
    return `${(delayMs / MS_PER_SECOND).toFixed(DELAY_DISPLAY_DECIMAL_PLACES)}s`;
  }

  return `${delayMs}ms`;
}
