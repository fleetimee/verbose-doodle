import { Loader2, Server } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

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
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md space-y-8 px-8"
        initial={{ scale: 0.9, opacity: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        {/* Icon with pulsing animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="rounded-full bg-primary/10 p-6">
              <Server className="h-12 w-12 text-primary" />
            </div>
            <motion.div
              animate={{
                scale: [PULSE_SCALE_MIN, PULSE_SCALE_MAX, PULSE_SCALE_MIN],
              }}
              className="absolute inset-0 rounded-full bg-primary/5"
              transition={{
                duration: PULSE_DURATION_S,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 text-center">
          <motion.h3
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-xl"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {message}
          </motion.h3>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Your changes are being applied to the server. Please wait while the
            configuration settles.
          </motion.p>
        </div>

        {/* Countdown Timer */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-mono text-2xl tabular-nums">
            {secondsRemaining}s
          </span>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5, duration: 0.4 }}
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
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          This ensures the API is ready to handle requests with the new behavior
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
