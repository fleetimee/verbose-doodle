import { AppleIcon, ComputerIcon } from "@hugeicons/core-free-icons";
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

export function ServerRdpGuide({
  entry,
  isAdmin,
}: {
  entry: ServerEntry;
  isAdmin: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [defaultPlatform] = useState(detectClientPlatform);
  const host =
    entry.host.includes(":") && !entry.host.startsWith("[")
      ? `[${entry.host}]`
      : entry.host;
  const address = `${host}:${entry.port ?? 3389}`;
  const windowsCommand = `mstsc '/v:${address.replaceAll("'", "''")}'`;
  const platforms = [
    {
      value: "windows",
      label: "Windows",
      icon: <Microsoft aria-hidden="true" size={16} />,
      intro: copy.rdpWindowsIntro,
      steps: [copy.rdpWindowsConnect],
      valueToCopy: windowsCommand,
      copyLabel: copy.rdpCopyCommand,
      reference:
        "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/mstsc",
    },
    {
      value: "linux",
      label: "Linux",
      icon: <Linux aria-hidden="true" size={16} />,
      intro: copy.rdpLinuxIntro,
      steps: [copy.rdpLinuxProfile, copy.rdpLinuxConnect],
      valueToCopy: address,
      copyLabel: copy.rdpCopyAddress,
      reference: "https://remmina.org/how-to-install-remmina/",
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
      intro: copy.rdpMacIntro,
      steps: [copy.rdpMacProfile, copy.rdpMacConnect],
      valueToCopy: address,
      copyLabel: copy.rdpCopyAddress,
      reference:
        "https://learn.microsoft.com/en-us/windows-app/get-started-connect-devices-desktops-apps?pivots=remote-pc",
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
    <section aria-labelledby="server-detail-rdp" className="space-y-3">
      <h3 className="font-medium" id="server-detail-rdp">
        {copy.rdpTitle}
      </h3>
      {isAdmin && (
        <div className="space-y-2">
          <Button
            disabled={!(entry.username && entry.hasPassword)}
            onClick={() => {
              const desktopWindow = window.open(
                `/servers/${encodeURIComponent(entry.id)}/desktop`,
                "_blank",
                "popup,width=1280,height=800"
              );
              if (desktopWindow) {
                desktopWindow.opener = null;
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
              icon={ComputerIcon}
              strokeWidth={2}
            />
            {copy.rdpOpenDesktop}
          </Button>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {entry.username && entry.hasPassword
              ? copy.rdpBrowserIntro
              : copy.rdpCredentialsRequired}
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
                  {platform.valueToCopy}
                </code>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={platform.copyLabel}
                      onClick={() => copyValue(platform.valueToCopy)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <CopyIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{platform.copyLabel}</TooltipContent>
                </Tooltip>
              </div>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed">
                <li>{copy.rdpNetwork}</li>
                {platform.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>{copy.rdpAuthenticate}</li>
              </ol>
              <a
                className="text-primary text-xs underline underline-offset-4"
                href={platform.reference}
                rel="noopener noreferrer"
                target="_blank"
              >
                {copy.rdpReference}
              </a>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
