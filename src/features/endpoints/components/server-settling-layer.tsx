import { Loading03Icon, ServerStackIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const SETTLING_DURATION_MS = 10_000;
const PROGRESS_UPDATE_INTERVAL_MS = 50;
const PERCENT_MULTIPLIER = 100;
const MS_TO_SECONDS = 1000;
const PULSE_DURATION_S = 2;
const PULSE_SCALE_MAX = 1.2;
const PULSE_SCALE_MIN = 1;

type ServerSettlingLayerProps = {
  onComplete: () => void;
  message?: string;
};

/**
 * A beautiful overlay that displays while waiting for the server to settle
 * after changing response behavior. Shows a countdown and progress bar.
 */
export function ServerSettlingLayer({
  onComplete,
  message = "Waiting for server to settle...",
}: ServerSettlingLayerProps) {
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const [secondsRemaining, setSecondsRemaining] = useState(
    SETTLING_DURATION_MS / MS_TO_SECONDS
  );

  useEffect(() => {
    const startTime = Date.now();

    // Update progress bar
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(
        (elapsed / SETTLING_DURATION_MS) * PERCENT_MULTIPLIER,
        PERCENT_MULTIPLIER
      );
      setProgress(newProgress);

      // Update seconds remaining
      const remaining = Math.max(
        0,
        Math.ceil((SETTLING_DURATION_MS - elapsed) / MS_TO_SECONDS)
      );
      setSecondsRemaining(remaining);

      if (elapsed >= SETTLING_DURATION_MS) {
        clearInterval(progressInterval);
        onComplete();
      }
    }, PROGRESS_UPDATE_INTERVAL_MS);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 px-8"
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
        transition={{
          duration: MOTION_DURATION.standard,
          ease: MOTION_EASE.out,
        }}
      >
        {/* Icon with pulsing animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="rounded-full bg-primary/10 p-6">
              <HugeiconsIcon
                className="h-12 w-12 text-primary"
                icon={ServerStackIcon}
                strokeWidth={2}
              />
            </div>
            <motion.div
              animate={{
                scale: shouldReduceMotion
                  ? PULSE_SCALE_MIN
                  : [PULSE_SCALE_MIN, PULSE_SCALE_MAX, PULSE_SCALE_MIN],
              }}
              className="absolute inset-0 rounded-full bg-primary/5"
              transition={{
                duration: PULSE_DURATION_S,
                ease: "easeInOut",
                repeat: shouldReduceMotion ? 0 : Number.POSITIVE_INFINITY,
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 text-center">
          <motion.h3
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-xl"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            transition={{ duration: MOTION_DURATION.standard }}
          >
            {message}
          </motion.h3>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            transition={{ duration: MOTION_DURATION.standard }}
          >
            Your changes are being applied to the server. Please wait while the
            configuration settles.
          </motion.p>
        </div>

        {/* Countdown Timer */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
          transition={{ duration: MOTION_DURATION.standard }}
        >
          <HugeiconsIcon
            className="h-5 w-5 text-primary motion-safe:animate-spin"
            icon={Loading03Icon}
            strokeWidth={2}
          />
          <span className="font-mono text-2xl tabular-nums">
            {secondsRemaining}s
          </span>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          transition={{ duration: MOTION_DURATION.standard }}
        >
          <Progress className="h-2" value={progress} />
          <p className="text-center text-muted-foreground text-xs">
            {Math.round(progress)}% complete
          </p>
        </motion.div>

        {/* Hint */}
        <motion.p
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground text-xs"
          initial={{ opacity: 0 }}
          transition={{ duration: MOTION_DURATION.standard }}
        >
          This ensures the API is ready to handle requests with the new behavior
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
