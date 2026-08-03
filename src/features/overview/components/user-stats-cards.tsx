import type { HugeIcon } from "@/components/hugeicons";
import { ShieldCheck, UserCheck, Users } from "@/components/hugeicons";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";
import { formatMessage, messages } from "@/lib/i18n";

type UserMetricProps = {
  readonly title: string;
  readonly value: number;
  readonly detail: string;
  readonly icon: HugeIcon;
};

function UserMetric({ title, value, detail, icon: Icon }: UserMetricProps) {
  return (
    <Card className="group border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none">
      <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="font-semibold text-foreground text-sm">{title}</p>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:bg-primary/5 group-hover:text-primary">
            <Icon aria-hidden className="size-4" />
          </div>
        </div>
        <div>
          <p className="font-bold font-mono text-3xl tabular-nums tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type UserStatsCardsProps = {
  readonly data: OverviewData;
};

export function UserStatsCards({ data }: UserStatsCardsProps) {
  if (!data.userStats) {
    return null;
  }

  const { totalUsers, activeUsers, inactiveUsers, adminUsers, regularUsers } =
    data.userStats;

  return (
    <>
      <UserMetric
        detail={messages.overview.registeredAccounts}
        icon={Users}
        title={messages.overview.totalUsersTitle}
        value={totalUsers}
      />
      <UserMetric
        detail={formatMessage(messages.overview.inactiveUsers, {
          count: inactiveUsers,
        })}
        icon={UserCheck}
        title={messages.overview.activeUsersTitle}
        value={activeUsers}
      />
      <UserMetric
        detail={formatMessage(messages.overview.regularUsers, {
          count: regularUsers,
        })}
        icon={ShieldCheck}
        title={messages.overview.adminUsersTitle}
        value={adminUsers}
      />
    </>
  );
}
