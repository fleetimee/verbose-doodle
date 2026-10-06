import { AppleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Linux, Microsoft } from "developer-icons";
import { useId, useState } from "react";
import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServerEntry } from "@/features/server-inventory/types";
import { detectClientPlatform } from "@/features/server-inventory/utils/detect-client-platform";
import { copyToClipboard } from "@/lib/clipboard";

const HOST_BRACKETS = /^\[|\]$/g;

export function ServerSmbGuide({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [defaultPlatform] = useState(detectClientPlatform);
  const [share, setShare] = useState("");
  const shareId = useId();
  const shareName = share
    .trim()
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .join("/");
  const rawHost = entry.host.replace(HOST_BRACKETS, "");
  const windowsHost = rawHost.includes(":")
    ? `${rawHost.replaceAll(":", "-").replaceAll("%", "s")}.ipv6-literal.net`
    : rawHost;
  const host = rawHost.includes(":") ? `[${rawHost}]` : rawHost;
  const windowsPath = `\\\\${windowsHost}${shareName ? `\\${shareName.replaceAll("/", "\\")}` : ""}`;
  const smbUrl = `smb://${host}${shareName ? `/${shareName.split("/").map(encodeURIComponent).join("/")}` : ""}`;
  const platforms = [
    {
      value: "windows",
      label: "Windows",
      icon: <Microsoft aria-hidden="true" size={16} />,
      intro: copy.smbWindowsIntro,
      steps: [copy.smbWindowsConnect],
      valueToCopy: windowsPath,
      copyLabel: copy.smbCopyPath,
      reference:
        "https://support.microsoft.com/en-us/windows/experience/connectivity-networking/file-sharing-over-a-network-in-windows",
    },
    {
      value: "linux",
      label: "Linux",
      icon: <Linux aria-hidden="true" size={16} />,
      intro: copy.smbLinuxIntro,
      steps: [copy.smbLinuxConnect],
      valueToCopy: smbUrl,
      copyLabel: copy.smbCopyPath,
      reference:
        "https://help.gnome.org/users/gnome-help/stable/nautilus-connect.html.en",
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
      intro: copy.smbMacIntro,
      steps: [copy.smbMacConnect],
      valueToCopy: smbUrl,
      copyLabel: copy.smbCopyPath,
      reference:
        "https://support.apple.com/guide/mac-help/connect-to-shared-computers-and-servers-mchlp1140/mac",
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
    <section aria-labelledby="server-detail-smb" className="space-y-3">
      <h3 className="font-medium" id="server-detail-smb">
        {copy.smbTitle}
      </h3>
      <div className="space-y-2">
        <Label htmlFor={shareId}>{copy.smbShare}</Label>
        <Input
          id={shareId}
          onChange={(event) => setShare(event.target.value)}
          placeholder={copy.smbSharePlaceholder}
          value={share}
        />
        <p className="text-muted-foreground text-xs leading-relaxed">
          {copy.smbShareHint}
        </p>
      </div>
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
                <li>{copy.databaseNetwork}</li>
                {platform.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>{copy.smbAuthenticate}</li>
              </ol>
              {entry.port !== null && entry.port !== 445 && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {copy.smbPortHint}
                </p>
              )}
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
