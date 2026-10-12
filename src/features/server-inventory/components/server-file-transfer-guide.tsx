import { AppleIcon, Folder01Icon } from "@hugeicons/core-free-icons";
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

export function ServerFileTransferGuide({
  entry,
  isAdmin,
}: {
  entry: ServerEntry;
  isAdmin: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [defaultPlatform] = useState(detectClientPlatform);
  const type = entry.accessType.toUpperCase();
  const isSftp = type === "SFTP";
  const isFtps = type === "FTPS";
  const port = entry.port ?? (isSftp ? 22 : 21);
  const settings = [
    { label: copy.host, value: entry.host },
    { label: copy.port, value: String(port) },
    { label: copy.username, value: entry.username || copy.notSet },
  ];
  const protocolStep = isSftp ? copy.transferSftp : copy.transferFtp;
  const encryptionStep = isFtps ? copy.transferFtps : copy.transferPlainFtp;
  const platforms = [
    {
      value: "windows",
      label: "Windows",
      icon: <Microsoft aria-hidden="true" size={16} />,
      intro: copy.transferWindowsIntro,
      steps: [protocolStep, ...(isSftp ? [] : [encryptionStep])],
      reference: "https://winscp.net/eng/docs/guide_connect",
    },
    {
      value: "linux",
      label: "Linux",
      icon: <Linux aria-hidden="true" size={16} />,
      intro: copy.transferLinuxIntro,
      steps: [protocolStep, ...(isSftp ? [] : [encryptionStep])],
      reference: "https://wiki.filezilla-project.org/Site_Manager",
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
      intro: copy.transferMacIntro,
      steps: [protocolStep, ...(isSftp ? [] : [encryptionStep])],
      reference: "https://wiki.filezilla-project.org/Site_Manager",
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
    <section aria-labelledby="server-detail-transfer" className="space-y-3">
      <h3 className="font-medium" id="server-detail-transfer">
        {copy.transferTitle.replace("{type}", type)}
      </h3>
      {isAdmin && isSftp && (
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
              <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                {settings.map((setting) => (
                  <div
                    className="flex items-start justify-between gap-3 px-4 py-2.5"
                    key={setting.label}
                  >
                    <dt className="pt-1.5 text-muted-foreground">
                      {setting.label}
                    </dt>
                    <dd className="flex min-w-0 items-start gap-1 text-right">
                      <span className="min-w-0 break-all pt-1.5 font-mono">
                        {setting.value}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            aria-label={copy.databaseCopyField.replace(
                              "{field}",
                              setting.label
                            )}
                            onClick={() => copyValue(setting.value)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <CopyIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copy.databaseCopyField.replace(
                            "{field}",
                            setting.label
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </dd>
                  </div>
                ))}
              </dl>
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed">
                <li>{copy.databaseNetwork}</li>
                {platform.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
                <li>{copy.transferAuthenticate}</li>
              </ol>
              {isSftp && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {copy.transferSftpVerify}
                </p>
              )}
              {isFtps && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {copy.transferFtpsHint}
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
