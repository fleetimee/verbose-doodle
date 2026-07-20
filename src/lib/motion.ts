export const MOTION_DURATION = {
  instant: 0.01,
  fast: 0.15,
  press: 0.16,
  step: 0.18,
  standard: 0.2,
  panel: 0.25,
} as const;

export const MOTION_EASE = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
} as const;
