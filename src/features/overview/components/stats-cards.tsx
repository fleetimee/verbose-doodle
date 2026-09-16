import type { HugeIcon } from "@/components/hugeicons";
import { Activity, Building2, FileJson, Globe } from "@/components/hugeicons";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";
import { messages } from "@/lib/i18n";

type MetricCardProps = {
  readonly title: string;
  readonly value: number | string;
  readonly description: string;
  readonly icon: HugeIcon;
  readonly className?: string;
  readonly meta?: string;
};

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  meta,
}: MetricCardProps) {
  return (
    <Card className={className} variant="overview-interactive">
      <CardContent className="min-h-36 justify-between" size="overview">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground text-sm">
              {title}
            </p>
            <p className="mt-1 max-w-[28ch] text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:bg-primary/5 group-hover:text-primary">
            <Icon aria-hidden className="size-4" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-4">
          <p className="font-bold font-mono text-3xl tabular-nums tracking-tight sm:text-4xl">
            {value}
          </p>
          {meta ? (
            <p className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary text-xs">
              {meta}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data }: { readonly data: OverviewData }) {
  const overviewStats = data.stats;

  return (
    <>
      <MetricCard
        description={messages.overview.totalEndpointsDescription}
        icon={Globe}
        title={messages.overview.totalEndpointsTitle}
        value={overviewStats.totalEndpoints}
      />
      <MetricCard
        description={messages.overview.totalResponsesDescription}
        icon={FileJson}
        title={messages.overview.totalResponsesTitle}
        value={overviewStats.totalResponses}
      />
      <MetricCard
        description={messages.overview.activeResponsesDescription}
        icon={Activity}
        meta={overviewStats.activeResponsesPercentage}
        title={messages.overview.activeResponsesTitle}
        value={overviewStats.activeResponses}
      />
      <MetricCard
        description={messages.overview.totalBillersDescription}
        icon={Building2}
        title={messages.overview.totalBillersTitle}
        value={overviewStats.totalBillers}
      />
    </>
  );
}
