import { Cable, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
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

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex justify-end">
      <div className="pointer-events-auto inline-flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-md border border-border/70 bg-background/95 px-1.5 py-1 shadow-lg backdrop-blur">
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-1.5 rounded-sm border px-1.5 py-1 font-medium text-[11px]",
            floatingBridgeTone[bridge.bridgeStatus]
          )}
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
        </span>
        {bridge.bridgeAutoConnect ? (
          <Button
            className="h-6 gap-1 px-1.5 text-[11px]"
            onClick={bridge.disconnectBridge}
            type="button"
            variant="ghost"
          >
            <Unplug className="size-3" />
            Off
          </Button>
        ) : (
          <Button
            className="h-6 gap-1 px-1.5 text-[11px]"
            onClick={bridge.connectBridge}
            type="button"
            variant="ghost"
          >
            <Cable className="size-3" />
            On
          </Button>
        )}
      </div>
    </div>
  );
}
