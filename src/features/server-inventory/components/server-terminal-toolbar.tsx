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
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServerEntry } from "@/features/server-inventory/types";
import { cn } from "@/lib/utils";

interface TerminalToolbarProps {
  connected: boolean;
  disconnected: boolean;
  entry: ServerEntry;
  fontSize: number;
  fullscreen: boolean;
  hasSelection: boolean;
  keyboardInputRef: RefObject<HTMLTextAreaElement | null>;
  onClear: () => void;
  onCopy: () => void;
  onDisconnect: () => void;
  onFontSizeChange: (size: number) => void;
  onReconnect: () => void;
  onSelectAll: () => void;
  onSendPassword: (targetServerId: string) => void;
  onToggleFullscreen: () => void;
  otherServers?: ServerEntry[];
  sendingPassword?: boolean;
  statusLabel: string;
}

export function ServerTerminalToolbar({
  connected,
  disconnected,
  entry,
  fullscreen,
  keyboardInputRef,
  onDisconnect,
  onReconnect,
  fontSize,
  hasSelection,
  onClear,
  onCopy,
  onSelectAll,
  onFontSizeChange,
  onSendPassword,
  onToggleFullscreen,
  otherServers = [],
  sendingPassword = false,
  statusLabel,
}: TerminalToolbarProps) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const fullscreenLabel = fullscreen
    ? copy.sshExitFullscreen
    : copy.sshFullscreen;
  const healthy = connected;
  const connectionLabel = disconnected ? copy.sshReconnect : copy.sshDisconnect;
  const connectionAction = disconnected ? onReconnect : onDisconnect;
  const serversWithPassword = otherServers.filter(
    (server) => server.id !== entry.id && server.hasPassword
  );

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-3 py-1.5">
      <div
        className="min-w-0 max-w-48"
        title={`${entry.name} — ${entry.username}@${entry.host}:${entry.port ?? 22}`}
      >
        <h1 className="truncate font-semibold text-sm">{entry.name}</h1>
        <p className="truncate font-mono text-muted-foreground text-xs">
          {entry.username}@{entry.host}:{entry.port ?? 22}
        </p>
      </div>
      <Menubar
        aria-label={copy.sshMenuLabel}
        className="h-8 shrink-0"
        variant="plain"
      >
        <MenubarMenu>
          <MenubarTrigger>{copy.sshSessionMenu}</MenubarTrigger>
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
          <MenubarTrigger>{copy.sshTerminalMenu}</MenubarTrigger>
          <MenubarContent finalFocus={keyboardInputRef}>
            <MenubarGroup>
              <MenubarItem disabled={!hasSelection} onClick={onCopy}>
                {copy.sshCopySelection}
              </MenubarItem>
              <MenubarItem onClick={onSelectAll}>
                {copy.sshSelectAll}
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem onClick={onClear}>
                {copy.sshClearDisplay}
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{copy.sshCredentialsMenu}</MenubarTrigger>
          <MenubarContent finalFocus={keyboardInputRef}>
            <MenubarGroup>
              <MenubarItem
                disabled={!(connected && entry.hasPassword) || sendingPassword}
                onClick={() => onSendPassword(entry.id)}
              >
                {copy.sshPasteServerPassword}
              </MenubarItem>
            </MenubarGroup>
            {serversWithPassword.length > 0 && (
              <>
                <MenubarSeparator />
                <MenubarGroup>
                  <MenubarSub>
                    <MenubarSubTrigger disabled={!connected || sendingPassword}>
                      {copy.sshPasteOtherServerPassword}
                    </MenubarSubTrigger>
                    <MenubarSubContent className="max-h-64 overflow-y-auto">
                      {serversWithPassword.map((server) => (
                        <MenubarItem
                          key={server.id}
                          onClick={() => onSendPassword(server.id)}
                        >
                          <span className="truncate">
                            {server.name} ({server.username ?? server.host})
                          </span>
                        </MenubarItem>
                      ))}
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarGroup>
              </>
            )}
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>{copy.sshViewMenu}</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onClick={onToggleFullscreen}>
                {fullscreenLabel}
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem
                disabled={fontSize >= 24}
                onClick={() => onFontSizeChange(fontSize + 1)}
              >
                {copy.sshLargerText}
              </MenubarItem>
              <MenubarItem
                disabled={fontSize <= 10}
                onClick={() => onFontSizeChange(fontSize - 1)}
              >
                {copy.sshSmallerText}
              </MenubarItem>
              <MenubarItem
                disabled={fontSize === 14}
                onClick={() => onFontSizeChange(14)}
              >
                {copy.sshResetTextSize}
                <MenubarShortcut>{fontSize}px</MenubarShortcut>
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
