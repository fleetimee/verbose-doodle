import { motion } from "motion/react";
import {
  CalendarIcon,
  ExternalLinkIcon,
  GitCommitIcon,
  LayersIcon,
  ShieldCheckIcon,
  TagIcon,
} from "lucide-react";
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
  buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP || "2026-07-21 13:56 WIB",
  environment = import.meta.env.MODE === "production" ? "Production" : "Development",
  giteaCommitUrl,
  giteaReleasesUrl,
}: AboutVersionFooterProps) {
  const commitUrl =
    giteaCommitUrl || `${DEFAULT_GITEA_BASE}/commit/${commitSha}`;
  const releasesUrl = giteaReleasesUrl || `${DEFAULT_GITEA_BASE}/releases`;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-5 shadow-xs backdrop-blur-xs transition-colors hover:border-border"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 1.3 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayersIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-base text-foreground">
            System & Release Information
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className="flex items-center gap-1.5 font-semibold text-xs"
            variant={environment === "Production" ? "default" : "secondary"}
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            {environment}
          </Badge>
          <a
            className="flex items-center gap-1 font-medium text-muted-foreground text-xs transition-colors hover:text-primary"
            href={releasesUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Releases
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Version Badge */}
        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <TagIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-muted-foreground text-xs">
              Version Tag
            </span>
            <span className="font-semibold text-foreground text-sm">
              v{version}
            </span>
          </div>
        </div>

        {/* Git Commit SHA */}
        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <GitCommitIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-muted-foreground text-xs">
              Git Release SHA
            </span>
            <a
              className="inline-flex items-center gap-1 font-mono font-semibold text-primary text-sm hover:underline"
              href={commitUrl}
              rel="noopener noreferrer"
              target="_blank"
              title={`View commit ${commitSha} on Gitea`}
            >
              {commitSha.substring(0, 7)}
              <ExternalLinkIcon className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>

        {/* Build Date */}
        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-muted-foreground text-xs">
              Build Timestamp
            </span>
            <span className="font-semibold text-foreground text-sm truncate">
              {buildTimestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
