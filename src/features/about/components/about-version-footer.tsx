import { Calendar03Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import {
  GitCommitIcon,
  LayersIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";

export type AboutVersionFooterProps = {
  version?: string;
  commitSha?: string;
  buildTimestamp?: string;
  environment?: string;
  giteaCommitUrl?: string;
  giteaReleasesUrl?: string;
};

const DEFAULT_GITEA_BASE =
  "http://192.168.4.62/BPD_DIY_DEV_WEB_DASHBOARD/BILLER_SIMULATOR_JSON";

export function AboutVersionFooter({
  version = import.meta.env.VITE_APP_VERSION || "1.2.0",
  commitSha = import.meta.env.VITE_GIT_COMMIT_SHA || "8bd0927",
  buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP ||
    "2026-07-21 13:56 WIB",
  environment = import.meta.env.MODE === "production"
    ? "Production"
    : "Development",
  giteaCommitUrl,
  giteaReleasesUrl,
}: AboutVersionFooterProps) {
  const commitUrl =
    giteaCommitUrl || `${DEFAULT_GITEA_BASE}/commit/${commitSha}`;
  const releasesUrl = giteaReleasesUrl || `${DEFAULT_GITEA_BASE}/releases`;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 shadow-xs backdrop-blur-xs transition-colors hover:border-border"
      initial={{ opacity: 0, y: 14 }}
      transition={{ delay: 0.25, duration: 0.35 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">
            System & Release Information
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className="flex items-center gap-1.5 font-semibold text-[11px]"
            variant={environment === "Production" ? "default" : "secondary"}
          >
            <ShieldCheckIcon className="h-3 w-3" />
            {environment}
          </Badge>
          <a
            className="flex items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-primary"
            href={releasesUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Releases
            <HugeiconsIcon
              className="h-3 w-3"
              icon={LinkSquare02Icon}
              strokeWidth={2}
            />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* Version Badge */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/60 p-2.5">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <TagIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-[11px] text-muted-foreground">
              Version Tag
            </span>
            <span className="font-semibold text-foreground text-xs">
              v{version}
            </span>
          </div>
        </div>

        {/* Git Commit SHA */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/60 p-2.5">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <GitCommitIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-[11px] text-muted-foreground">
              Git Release SHA
            </span>
            <a
              className="inline-flex items-center gap-1 font-mono font-semibold text-primary text-xs hover:underline"
              href={commitUrl}
              rel="noopener noreferrer"
              target="_blank"
              title={`View commit ${commitSha} on Gitea`}
            >
              {commitSha.slice(0, 7)}
              <HugeiconsIcon
                className="h-2.5 w-2.5 opacity-75"
                icon={LinkSquare02Icon}
                strokeWidth={2}
              />
            </a>
          </div>
        </div>

        {/* Build Date */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/60 p-2.5">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <HugeiconsIcon
              className="h-3.5 w-3.5"
              icon={Calendar03Icon}
              strokeWidth={2}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-[11px] text-muted-foreground">
              Build Timestamp
            </span>
            <span className="truncate font-semibold text-foreground text-xs">
              {buildTimestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
