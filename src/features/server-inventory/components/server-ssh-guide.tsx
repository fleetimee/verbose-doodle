import {
  AppleIcon,
  ComputerTerminal01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Linux, Microsoft } from "developer-icons";
import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServerEntry } from "@/features/server-inventory/types";
import { detectClientPlatform } from "@/features/server-inventory/utils/detect-client-platform";
import { copyToClipboard } from "@/lib/clipboard";

function quoteShellArgument(value: string) {
  return `'${value.replaceAll("'", "'\"'\"'")}'`;
}

export function ServerSshGuide({
  entry,
  isAdmin,
}: {
  entry: ServerEntry;
  isAdmin: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [defaultPlatform] = useState(detectClientPlatform);
  const sshCommand = [
    "ssh",
    "-p",
    String(entry.port ?? 22),
    ...(entry.username ? ["-l", quoteShellArgument(entry.username)] : []),
    "--",
    quoteShellArgument(entry.host),
  ].join(" ");
  const windowsCommand = [
    "ssh",
    "-p",
    String(entry.port ?? 22),
    ...(entry.username
      ? ["-l", `'${entry.username.replaceAll("'", "''")}'`]
      : []),
    "--",
    `'${entry.host.replaceAll("'", "''")}'`,
  ].join(" ");
  const platforms = [
    {
      value: "windows",
      label: "Windows",
      icon: <Microsoft aria-hidden="true" size={16} />,
      intro: copy.sshWindowsIntro,
      command: windowsCommand,
    },
    {
      value: "linux",
      label: "Linux",
      icon: <Linux aria-hidden="true" size={16} />,
      intro: copy.sshLinuxIntro,
      command: sshCommand,
    },
    {
      value: "macos",
      label: "macOS",
      icon: (
        <HugeiconsIcon
          aria-hidden="true"
          icon={AppleIcon}
          size={16}
          strokeWidth={1.8}
        />
      ),
      intro: copy.sshMacIntro,
      command: sshCommand,
    },
  ];
  async function copyValue(value: string) {
    try {
      if (await copyToClipboard(value)) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }
  return (
    <section aria-labelledby="server-detail-ssh" className="space-y-3">
      <h3 className="font-medium" id="server-detail-ssh">
        {copy.sshTitle}
      </h3>
      {isAdmin && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              disabled={!(entry.username && entry.hasPassword)}
              onClick={() => {
                const terminalWindow = window.open(
                  `/servers/${encodeURIComponent(entry.id)}/terminal`,
                  "_blank",
                  "popup,width=1100,height=720"
                );
                if (terminalWindow) {
                  terminalWindow.opener = null;
                } else {
                  toast.error(copy.sshPopupBlocked);
                }
              }}
              size="xs"
              variant="outline"
            >
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={ComputerTerminal01Icon}
                strokeWidth={2}
              />
              {copy.sshOpenTerminal}
            </Button>
            <Button
              disabled={!(entry.username && entry.hasPassword)}
              onClick={() => {
                const filesWindow = window.open(
                  `/servers/${encodeURIComponent(entry.id)}/files`,
                  "_blank",
                  "popup,width=1300,height=800"
                );
                if (filesWindow) {
                  filesWindow.opener = null;
                } else {
                  toast.error(copy.sshPopupBlocked);
                }
              }}
              size="xs"
              variant="outline"
            >
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={Folder01Icon}
              />
              {copy.sftpOpenBrowser}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {entry.username && entry.hasPassword
              ? copy.sshBrowserIntro
              : copy.sshCredentialsRequired}
          </p>
        </div>
      )}
      <Tabs defaultValue={defaultPlatform}>
        <TabsList aria-label={copy.rdpPlatform} className="w-full">
          {platforms.map((platform) => (
            <TabsTrigger key={platform.value} value={platform.value}>
              {platform.icon}
              {platform.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {platforms.map((platform) => (
          <TabsContent key={platform.value} value={platform.value}>
            <div className="space-y-3 pt-2">
              <p className="text-muted-foreground leading-relaxed">
                {platform.intro}
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <code className="min-w-0 flex-1 whitespace-pre-wrap break-all pt-1.5 font-mono text-sm">
                  {platform.command}
                </code>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={copy.sshCopyCommand}
                      onClick={() => copyValue(platform.command)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <CopyIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copy.sshCopyCommand}</TooltipContent>
                </Tooltip>
              </div>
              {!entry.username && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {copy.sshMissingUsername}
                </p>
              )}
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed">
                <li>{copy.sshNetwork}</li>
                <li>{copy.sshFingerprint}</li>
                <li>{copy.sshAuthenticate}</li>
              </ol>
              <a
                className="text-primary text-xs underline underline-offset-4"
                href="https://man.openbsd.org/ssh.1"
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.sshReference}
              </a>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
