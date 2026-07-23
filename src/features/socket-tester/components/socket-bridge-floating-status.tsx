import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Cable, Unplug } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const floatingBridgeTone = {
  connected:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  connecting:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  disconnected: "border-border/70 bg-muted/45 text-muted-foreground",
};

export function SocketBridgeFloatingStatus() {
  const bridge = useSocketBridgeContext();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const contentScale = shouldReduceMotion ? 1 : 0.97;
  const contentTransition = {
    duration: MOTION_DURATION.fast,
    ease: MOTION_EASE.out,
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex justify-end">
      <div className="pointer-events-auto inline-flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-md border border-border/70 bg-background/95 px-1.5 py-1 shadow-lg backdrop-blur">
        <span
          className={cn(
            "relative inline-flex h-7 w-[calc(12ch+1.5rem)] shrink-0 items-center rounded-sm border font-medium text-[11px]",
            floatingBridgeTone[bridge.bridgeStatus]
          )}
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.span
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 inline-flex items-center gap-1.5 px-1.5 py-1"
              exit={{ opacity: 0, scale: contentScale }}
              initial={{ opacity: 0, scale: contentScale }}
              key={bridge.bridgeStatus}
              transition={contentTransition}
            >
              <span className="relative flex size-1.5">
                {bridge.bridgeStatus === "connected" && (
                  <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-40 motion-safe:animate-ping" />
                )}
                <span
                  className={cn(
                    "relative inline-flex size-1.5 rounded-full",
                    bridge.bridgeStatus === "connected" && "bg-emerald-400",
                    bridge.bridgeStatus === "connecting" && "bg-amber-400",
                    bridge.bridgeStatus === "disconnected" &&
                      "bg-muted-foreground/50"
                  )}
                />
              </span>
              <span className="truncate font-mono uppercase tracking-[0.1em]">
                {bridge.bridgeStatus}
              </span>
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative inline-flex h-6 w-11 shrink-0">
          <AnimatePresence initial={false} mode="sync">
            {bridge.bridgeAutoConnect ? (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, scale: contentScale }}
                initial={{ opacity: 0, scale: contentScale }}
                key="bridge-action-off"
                transition={contentTransition}
              >
                <Button
                  className="h-6 w-full gap-1 px-1.5 text-[11px]"
                  onClick={bridge.disconnectBridge}
                  type="button"
                  variant="ghost"
                >
                  <Unplug className="size-3" />
                  Off
                </Button>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, scale: contentScale }}
                initial={{ opacity: 0, scale: contentScale }}
                key="bridge-action-on"
                transition={contentTransition}
              >
                <Button
                  className="h-6 w-full gap-1 px-1.5 text-[11px]"
                  onClick={bridge.connectBridge}
                  type="button"
                  variant="ghost"
                >
                  <Cable className="size-3" />
                  On
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </span>
      </div>
    </div>
  );
}
