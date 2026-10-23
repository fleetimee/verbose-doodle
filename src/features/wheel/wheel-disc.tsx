import {
  type MotionStyle,
  type MotionValue,
  motion,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useRef } from "react";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
import type { WheelDraw } from "@/features/wheel/api";
import { getWheelSpinAngles } from "@/features/wheel/wheel-motion";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motion";

const rotationTransformSchema = z
  .string()
  .regex(/^rotate\((-?[\d.e+-]+)deg\)$/)
  .transform((value) => Number.parseFloat(value.slice(7)))
  .pipe(z.number().finite());

function sector(index: number, count: number) {
  const start = (index * Math.PI * 2) / count - Math.PI / 2;
  const end = ((index + 1) * Math.PI * 2) / count - Math.PI / 2;
  return `M 250 250 L ${250 + 225 * Math.cos(start)} ${250 + 225 * Math.sin(start)} A 225 225 0 ${count === 2 ? 0 : Number(end - start > Math.PI)} 1 ${250 + 225 * Math.cos(end)} ${250 + 225 * Math.sin(end)} Z`;
}

export function WheelDisc({
  entries,
  fit = false,
  idleSpin = false,
  eligible,
  draw,
  playing,
  replay,
  onComplete,
}: {
  entries: string[];
  fit?: boolean;
  idleSpin?: boolean;
  eligible: number[];
  draw: Pick<WheelDraw, "id" | "rotationMilliDegrees" | "durationMs"> | null;
  playing: boolean;
  replay: number;
  onComplete?: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const reduce = useReducedMotion();
  const pointer = useSpring(0, MOTION_SPRING.snappy);
  const pointerStyle: MotionStyle & {
    "--wheel-pointer-angle": MotionValue<number>;
  } = { "--wheel-pointer-angle": pointer };
  const lastCrossing = useRef({ run: "", segment: 0, rotation: 0 });
  const run = `${draw?.id || "ready"}:${replay}`;
  function updatePointer(angle: number) {
    if (!playing || reduce || eligible.length < 2) {
      return;
    }
    const segment = Math.floor(angle / (360 / eligible.length));
    const previous = lastCrossing.current;
    lastCrossing.current = { run, segment, rotation: angle };
    if (previous.run !== run || segment === previous.segment) {
      return;
    }
    const kick = Math.min(22, 8 + Math.abs(angle - previous.rotation));
    pointer.jump(-Math.sign(angle - previous.rotation) * kick);
    pointer.set(0);
  }

  let labelSize = 20;
  if (eligible.length > 8) {
    labelSize = 15;
  }
  if (eligible.length > 15) {
    labelSize = 11;
  }
  const rotation = (draw?.rotationMilliDegrees || 0) / 1000;
  const moving = playing && !reduce && eligible.length > 1;
  const initialRotation = moving ? 0 : rotation;
  const frames = getWheelSpinAngles(rotation, eligible.length).map(
    (angle) => `rotate(${angle}deg)`
  );
  return (
    <div
      className={
        fit
          ? "wheel-disc-fit relative mx-auto"
          : "relative mx-auto aspect-square w-full max-w-lg"
      }
    >
      <motion.svg
        animate={{ transform: moving ? frames : `rotate(${rotation}deg)` }}
        aria-label={copy.wheelLabel}
        className={
          idleSpin
            ? "wheel-preview-spin size-full origin-center"
            : "size-full origin-center"
        }
        initial={{ transform: `rotate(${initialRotation}deg)` }}
        key={`${draw?.id || "ready"}:${replay}`}
        onAnimationComplete={onComplete}
        onUpdate={(latest) => {
          const parsed = rotationTransformSchema.safeParse(latest.transform);
          if (parsed.success) {
            updatePointer(parsed.data);
          }
        }}
        role="img"
        transition={{
          duration: moving ? (draw?.durationMs || 0) / 1000 : 0.01,
          times: moving ? [0, 0.86, 0.97, 1] : undefined,
          ease: moving
            ? [MOTION_EASE.out, MOTION_EASE.inOut, MOTION_EASE.out]
            : MOTION_EASE.out,
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
        <motion.g className="wheel-pointer-flap" style={pointerStyle}>
          <path
            d="M 238 9 Q 250 3 262 9 L 253 43 Q 250 48 247 43 Z"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="2"
          />
        </motion.g>
        <circle
          cx="250"
          cy="10"
          fill="var(--foreground)"
          r="5"
          stroke="var(--background)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
