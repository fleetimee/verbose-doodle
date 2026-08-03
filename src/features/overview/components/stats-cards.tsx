import type { HugeIcon } from "@/components/hugeicons";
import { Activity, Building2, FileJson, Globe } from "@/components/hugeicons";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    <Card
      className={cn(
        "group overflow-hidden border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_55px_-34px_color-mix(in_oklab,var(--primary)_65%,transparent)] active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
    >
      <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5 sm:p-6">
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
