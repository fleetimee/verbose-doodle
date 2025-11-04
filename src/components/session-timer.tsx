import { Clock, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTokenExpiration } from "@/features/auth/hooks/use-token-expiration";

// Show warning when token expires in less than 5 minutes
const WARNING_THRESHOLD_MS = 300_000;

export function SessionTimer() {
  const tokenExpiration = useTokenExpiration();

  // Don't show anything if there's no token
  if (!tokenExpiration) {
    return null;
  }

  const isWarning = tokenExpiration.remainingMs < WARNING_THRESHOLD_MS;

  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            className={
              isWarning ? "text-destructive hover:text-destructive" : ""
            }
            size="sm"
          >
            <Clock />
            <span>Session: {tokenExpiration.formattedTime}</span>
            <Info className="ml-auto opacity-60" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80" side="right">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Session Timer</h4>
            <p className="text-muted-foreground text-sm">
              Shows the remaining time before your authentication token expires.
              You'll be automatically logged out when the timer reaches zero.
            </p>
            {isWarning && (
              <p className="font-medium text-destructive text-sm">
                Warning: Your session will expire soon. Please save your work.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
}
