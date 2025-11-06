import { z } from "zod";

/**
 * Constants for delay validation
 */
export const MAX_DELAY_MS = 60_000; // 60 seconds

/**
 * Simulation type options
 */
export const SIMULATION_TYPE = {
  NONE: "none",
  DELAY: "delay",
  TIMEOUT: "timeout",
} as const;

export type SimulationType =
  (typeof SIMULATION_TYPE)[keyof typeof SIMULATION_TYPE];

/**
 * Schema for simulation type selection (step 1)
 */
export const simulationTypeSchema = z.object({
  type: z.enum([
    SIMULATION_TYPE.NONE,
    SIMULATION_TYPE.DELAY,
    SIMULATION_TYPE.TIMEOUT,
  ]),
});

export type SimulationTypeFormValues = z.infer<typeof simulationTypeSchema>;

/**
 * Schema for delay configuration (step 2 - conditional)
 */
export const delayConfigSchema = z.object({
  delayMs: z
    .number()
    .min(0, "Delay must be at least 0ms")
    .max(MAX_DELAY_MS, "Delay cannot exceed 60 seconds"),
});

export type DelayConfigFormValues = z.infer<typeof delayConfigSchema>;

/**
 * Combined schema for the entire simulation form
 */
export const simulationFormSchema = z
  .object({
    type: z.enum([
      SIMULATION_TYPE.NONE,
      SIMULATION_TYPE.DELAY,
      SIMULATION_TYPE.TIMEOUT,
    ]),
    delayMs: z.number().optional(),
  })
  .refine(
    (data) => {
      // If type is delay, delayMs must be provided and > 0
      if (data.type === SIMULATION_TYPE.DELAY) {
        return data.delayMs !== undefined && data.delayMs > 0;
      }
      return true;
    },
    {
      message: "Delay value is required when using delay simulation",
      path: ["delayMs"],
    }
  );

export type SimulationFormValues = z.infer<typeof simulationFormSchema>;

/**
 * Preset delay options in milliseconds
 */
export const DELAY_PRESETS = [
  { label: "100ms", value: 100 },
  { label: "500ms", value: 500 },
  { label: "1s", value: 1000 },
  { label: "2s", value: 2000 },
  { label: "3s", value: 3000 },
  { label: "5s", value: 5000 },
] as const;
