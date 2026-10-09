import {
  FullScreenIcon,
  Minimize01Icon,
  PowerIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { RefObject } from "react";
import { Link } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServerEntry } from "@/features/server-inventory/types";
import type { DesktopShortcut } from "@/features/server-inventory/utils/desktop-input";
import { cn } from "@/lib/utils";

interface DesktopToolbarProps {
  connected: boolean;
  disconnectButtonRef: RefObject<HTMLButtonElement | null>;
  disconnected: boolean;
  entry: ServerEntry;
  fullscreen: boolean;
  keyboardInputRef: RefObject<HTMLTextAreaElement | null>;
  onDisconnect: () => void;
  onReconnect: () => void;
  onShortcut: (shortcut: DesktopShortcut) => void;
  onToggleFullscreen: () => void;
  statusLabel: string;
  unstable: boolean;
}

export function ServerDesktopToolbar({
  connected,
  disconnected,
  disconnectButtonRef,
  entry,
  fullscreen,
  keyboardInputRef,
  onDisconnect,
  onReconnect,
  onShortcut,
  onToggleFullscreen,
  statusLabel,
  unstable,
}: DesktopToolbarProps) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const fullscreenLabel = fullscreen
    ? copy.rdpExitFullscreen
    : copy.rdpFullscreen;
  const healthy = connected && !unstable;
  const connectionLabel = disconnected ? copy.sshReconnect : copy.sshDisconnect;
  const connectionAction = disconnected ? onReconnect : onDisconnect;
  const desktopActions = [
    {
      action: "previous-desktop",
      label: copy.rdpPreviousDesktop,
      keys: "Win+Ctrl+Left",
    },
    {
      action: "next-desktop",
      label: copy.rdpNextDesktop,
      keys: "Win+Ctrl+Right",
    },
    { action: "task-view", label: copy.rdpTaskView, keys: "Win+Tab" },
    { action: "show-desktop", label: copy.rdpShowDesktop, keys: "Win+D" },
    {
      action: "task-manager",
      label: copy.rdpTaskManager,
      keys: "Ctrl+Shift+Esc",
    },
  ] as const;

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-3 py-1.5">
      <div
        className="min-w-0 max-w-48"
        title={`${entry.username}@${entry.host}:${entry.port ?? 3389}`}
      >
        <h1 className="truncate font-semibold text-sm">{entry.name}</h1>
        <p className="truncate font-mono text-muted-foreground text-xs">
          {entry.host}:{entry.port ?? 3389}
        </p>
      </div>
      <Menubar
        aria-label={copy.rdpMenuLabel}
        className="h-8 shrink-0"
        variant="plain"
      >
        <MenubarMenu>
          <MenubarTrigger>{copy.rdpSessionMenu}</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem disabled={!disconnected} onClick={onReconnect}>
                {copy.sshReconnect}
              </MenubarItem>
              <MenubarItem disabled={disconnected} onClick={onDisconnect}>
                {copy.sshDisconnect}
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem render={<Link to="/dashboard/servers" />}>
                {copy.sshBackToInventory}
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger disabled={!connected}>
            {copy.rdpDesktopMenu}
          </MenubarTrigger>
          <MenubarContent finalFocus={keyboardInputRef}>
            <MenubarGroup>
              {desktopActions.map(({ action, label, keys }) => (
                <MenubarItem key={action} onClick={() => onShortcut(action)}>
                  {label}
                  <MenubarShortcut>{keys}</MenubarShortcut>
                </MenubarItem>
              ))}
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem
                disabled={!connected}
                onClick={() => onShortcut("ctrl-alt-delete")}
              >
                {copy.rdpCtrlAltDelete}
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{copy.rdpViewMenu}</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onClick={onToggleFullscreen}>
                {fullscreenLabel}
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p
        aria-live="polite"
        className={cn(
          "ml-auto flex items-center gap-1.5 whitespace-nowrap text-xs",
          healthy ? "text-success" : "text-muted-foreground"
        )}
        role="status"
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full bg-current",
            healthy && "motion-safe:animate-pulse"
          )}
        />
        {statusLabel}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={fullscreenLabel}
                aria-pressed={fullscreen}
                onClick={onToggleFullscreen}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={fullscreen ? Minimize01Icon : FullScreenIcon}
              strokeWidth={2}
            />
          </TooltipTrigger>
          <TooltipContent>{fullscreenLabel}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={connectionLabel}
                onClick={connectionAction}
                ref={disconnectButtonRef}
                size="icon-sm"
                variant={disconnected ? "ghost" : "ghost-destructive"}
              />
            }
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={disconnected ? RefreshIcon : PowerIcon}
              strokeWidth={2}
            />
          </TooltipTrigger>
          <TooltipContent>{connectionLabel}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
