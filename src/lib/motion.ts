export const MOTION_DURATION = {
  fast: 0.15,
  instant: 0.01,
  panel: 0.25,
  press: 0.16,
  standard: 0.2,
  step: 0.18,
} as const;

export const MOTION_EASE = {
  inOut: [0.77, 0, 0.175, 1],
  out: [0.23, 1, 0.32, 1],
} as const;
