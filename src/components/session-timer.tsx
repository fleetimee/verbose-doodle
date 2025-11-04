import { Clock, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTokenExpiration } from "@/features/auth/hooks/use-token-expiration";
import { cn } from "@/lib/utils";

// Show warning when token expires in less than 5 minutes
const WARNING_THRESHOLD_MS = 300_000;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

function formatDigitalTime(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  if (ms <= 0) {
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  const totalSeconds = Math.floor(ms / MILLISECONDS_PER_SECOND);
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
}

export function SessionTimer() {
  const tokenExpiration = useTokenExpiration();

  // Don't show anything if there's no token
  if (!tokenExpiration) {
    return null;
  }

  const isWarning = tokenExpiration.remainingMs < WARNING_THRESHOLD_MS;
  const { hours, minutes, seconds } = formatDigitalTime(
    tokenExpiration.remainingMs
  );

  // Format time display - hide hours if zero
  const timeDisplay =
    hours === "00"
      ? `${minutes}m ${seconds}s`
      : `${hours}h ${minutes}m ${seconds}s`;

  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "transition-colors",
              isWarning && "text-destructive hover:text-destructive"
            )}
            size="sm"
          >
            <Clock className={cn(isWarning && "animate-pulse")} />
            <span>Session: {timeDisplay}</span>
            <Info className="ml-auto opacity-60" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80" side="right">
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-semibold leading-none">Session Timer</h4>
              <div className="mt-3 flex justify-center font-mono">
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
                  <div className="text-center">
                    <div
                      className={cn(
                        "rounded bg-background px-3 py-2 font-bold text-3xl tabular-nums",
                        isWarning && "text-destructive"
                      )}
                    >
                      {hours}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      hours
                    </div>
                  </div>
                  <span className="font-bold text-2xl">:</span>
                  <div className="text-center">
                    <div
                      className={cn(
                        "rounded bg-background px-3 py-2 font-bold text-3xl tabular-nums",
                        isWarning && "text-destructive"
                      )}
                    >
                      {minutes}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      minutes
                    </div>
                  </div>
                  <span className="font-bold text-2xl">:</span>
                  <div className="text-center">
                    <div
                      className={cn(
                        "rounded bg-background px-3 py-2 font-bold text-3xl tabular-nums",
                        isWarning && "text-destructive"
                      )}
                    >
                      {seconds}
                    </div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      seconds
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Your session will automatically refresh before expiration. You'll
              be logged out when the timer reaches zero.
            </p>
            {isWarning && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="font-medium text-destructive text-sm">
                  ⚠️ Session expiring soon! Your work will be saved
                  automatically.
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
}
