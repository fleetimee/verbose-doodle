import { ComputerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";
import { toast } from "sonner";
import { FileTerminal } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServerEntry } from "@/features/server-inventory/types";

export function ServerConnectionButton({
  entry,
  compact = false,
}: {
  entry: ServerEntry;
  compact?: boolean;
}) {
  const { messages } = useI18n();
  const windows = entry.accessType === "RDP";
  const label = windows
    ? messages.servers.rdpOpenDesktop
    : messages.servers.sshOpenTerminal;
  const openDesktop = () => {
    const desktop = window.open(
      `/servers/${encodeURIComponent(entry.id)}/desktop`,
      "_blank",
      "popup,width=1280,height=800"
    );
    if (desktop) {
      desktop.opener = null;
    } else {
      toast.error(messages.servers.sshPopupBlocked);
    }
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={`${label}: ${entry.name}`}
          disabled={!(entry.hasPassword && entry.username)}
          onClick={windows ? openDesktop : undefined}
          render={
            windows ? undefined : (
              <Link
                rel="noopener noreferrer"
                target="_blank"
                to={`/servers/${entry.id}/terminal`}
              />
            )
          }
          size={compact ? "icon-sm" : "sm"}
          variant={compact ? "ghost" : "outline"}
        >
          {windows ? (
            <HugeiconsIcon
              aria-hidden="true"
              data-icon={compact ? undefined : "inline-start"}
              icon={ComputerIcon}
            />
          ) : (
            <FileTerminal
              aria-hidden="true"
              data-icon={compact ? undefined : "inline-start"}
            />
          )}
          {!compact && label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
