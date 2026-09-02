export const MOTION_DURATION = {
  chat: 0.36,
  fast: 0.15,
  instant: 0.01,
  panel: 0.28,
  press: 0.16,
  smooth: 0.45,
  standard: 0.2,
  step: 0.18,
} as const;

export const MOTION_EASE = {
  apple: [0.16, 1, 0.3, 1] as const,
  fluid: [0.22, 1, 0.36, 1] as const,
  inOut: [0.77, 0, 0.175, 1] as const,
  out: [0.23, 1, 0.32, 1] as const,
} as const;

export const MOTION_SPRING = {
  bouncy: { bounce: 0.18, duration: 0.45, type: "spring" as const },
  chatMessage: { damping: 30, stiffness: 360, type: "spring" as const },
  composer: { damping: 32, stiffness: 300, type: "spring" as const },
  gentle: { bounce: 0.04, duration: 0.4, type: "spring" as const },
  snappy: { damping: 26, stiffness: 420, type: "spring" as const },
} as const;

