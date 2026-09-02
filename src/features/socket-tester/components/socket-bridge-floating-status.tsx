import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Cable, Unplug } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const bridgeTone = {
  connected:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  connecting:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  disconnected: "border-border/70 bg-muted/45 text-muted-foreground",
};

export function SocketBridgeStatus() {
  const bridge = useSocketBridgeContext();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const contentScale = shouldReduceMotion ? 1 : 0.97;
  const contentTransition = {
    duration: MOTION_DURATION.fast,
    ease: MOTION_EASE.out,
  };

  return (
    <div
      className="flex h-9 w-full items-center rounded-md border border-sidebar-border/70 bg-sidebar-accent/35 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent"
      title={`Socket bridge: ${bridge.bridgeStatus}`}
    >
      <span
        aria-label={`Socket bridge ${bridge.bridgeStatus}`}
        className={cn(
          "relative inline-flex h-full min-w-0 flex-1 items-center rounded-r-sm rounded-l-md border font-medium text-[11px] group-data-[collapsible=icon]:hidden",
          bridgeTone[bridge.bridgeStatus]
        )}
        role="status"
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
            <span className="truncate font-mono uppercase tracking-[0.1em] group-data-[collapsible=icon]:sr-only">
              {bridge.bridgeStatus}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
      <Dialog>
        <DialogTrigger
          aria-label="What is the socket bridge?"
          className="relative mx-1 inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          title="What is the socket bridge?"
        >
          <HugeiconsIcon
            className="size-3.5"
            icon={HelpCircleIcon}
            strokeWidth={2}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-0.5 -bottom-0.5 hidden size-2 rounded-full border border-sidebar bg-muted-foreground group-data-[collapsible=icon]:block",
              bridge.bridgeStatus === "connected" && "bg-emerald-500",
              bridge.bridgeStatus === "connecting" && "bg-amber-500"
            )}
          />
        </DialogTrigger>
        <DialogContent className="max-w-sm gap-3 p-4">
          <DialogHeader className="gap-1 pr-6">
            <DialogTitle className="text-base">Socket bridge</DialogTitle>
            <DialogDescription>
              Lets browser tools use TCP and UDP through the backend.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 text-sm leading-normal">
            <p>
              Used by TCP Client, TCP Server, UDP, and ISO 8583 “Send to TCP.”
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Connected</strong> means the
              bridge is available. It does not mean you are connected to a
              target TCP server.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <span className="relative mr-1 inline-flex h-6 w-11 shrink-0 group-data-[collapsible=icon]:hidden">
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
  );
}
