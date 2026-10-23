import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/components/i18n-provider";
import type { WheelDraw } from "@/features/wheel/api";
import { MOTION_EASE } from "@/lib/motion";

function sector(index: number, count: number) {
  const start = (index * Math.PI * 2) / count - Math.PI / 2;
  const end = ((index + 1) * Math.PI * 2) / count - Math.PI / 2;
  return `M 250 250 L ${250 + 225 * Math.cos(start)} ${250 + 225 * Math.sin(start)} A 225 225 0 ${count === 2 ? 0 : Number(end - start > Math.PI)} 1 ${250 + 225 * Math.cos(end)} ${250 + 225 * Math.sin(end)} Z`;
}

export function WheelDisc({
  entries,
  fit = false,
  eligible,
  draw,
  playing,
  replay,
  onComplete,
}: {
  entries: string[];
  fit?: boolean;
  eligible: number[];
  draw: WheelDraw | null;
  playing: boolean;
  replay: number;
  onComplete?: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const reduce = useReducedMotion();
  let labelSize = 20;
  if (eligible.length > 8) {
    labelSize = 15;
  }
  if (eligible.length > 15) {
    labelSize = 11;
  }
  const rotation = (draw?.rotationMilliDegrees || 0) / 1000;
  const initialRotation = playing && !reduce ? 0 : rotation;
  return (
    <div
      className={
        fit
          ? "wheel-disc-fit relative mx-auto"
          : "relative mx-auto aspect-square w-full max-w-lg"
      }
    >
      <motion.svg
        animate={{ transform: `rotate(${rotation}deg)` }}
        aria-label={copy.wheelLabel}
        className="size-full origin-center"
        initial={{ transform: `rotate(${initialRotation}deg)` }}
        key={`${draw?.id || "ready"}:${replay}`}
        onAnimationComplete={onComplete}
        role="img"
        transition={{
          duration: playing && !reduce ? (draw?.durationMs || 0) / 1000 : 0.01,
          ease: MOTION_EASE.out,
        }}
        viewBox="0 0 500 500"
      >
        <title>{copy.wheelLabel}</title>
        {eligible.map((entry, index) => {
          const mid = ((index + 0.5) * 360) / eligible.length;
          const palette = (entry % 8) + 1;
          const color = `var(--wheel-color-${palette})`;
          return (
            <g key={entry}>
              <title>{entries[entry]}</title>
              {eligible.length === 1 ? (
                <circle
                  cx="250"
                  cy="250"
                  fill={color}
                  r="225"
                  stroke="var(--border)"
                />
              ) : (
                <path
                  d={sector(index, eligible.length)}
                  fill={color}
                  stroke="var(--border)"
                />
              )}
              {eligible.length <= 30 && (
                <text
                  fill={`var(--wheel-on-color-${palette})`}
                  fontSize={labelSize}
                  textAnchor="end"
                  transform={`rotate(${mid - 90} 250 250)`}
                  x="450"
                  y="256"
                >
                  {entries[entry].slice(0, 20)}
                  {entries[entry].length > 20 ? "…" : ""}
                </text>
              )}
            </g>
          );
        })}
        <circle
          cx="250"
          cy="250"
          fill="var(--background)"
          r="32"
          stroke="var(--border)"
        />
        <circle cx="250" cy="250" fill="var(--primary)" r="9" />
      </motion.svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 500 500"
      >
        <path d="M 236 10 L 264 10 L 250 42 Z" fill="var(--primary)" />
      </svg>
    </div>
  );
}
