import type { LucideIcon } from "lucide-react";
import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";

type UserMetricProps = {
  readonly title: string;
  readonly value: number;
  readonly detail: string;
  readonly icon: LucideIcon;
};

function UserMetric({ title, value, detail, icon: Icon }: UserMetricProps) {
  return (
    <Card className="group border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 active:translate-y-px">
      <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="font-semibold text-foreground text-sm">{title}</p>
          <div className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition-colors group-hover:border-primary/35 group-hover:text-primary">
            <Icon />
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
        detail="Registered accounts"
        icon={Users}
        title="Total Users"
        value={totalUsers}
      />
      <UserMetric
        detail={`${inactiveUsers} inactive`}
        icon={UserCheck}
        title="Active Users"
        value={activeUsers}
      />
      <UserMetric
        detail={`${regularUsers} regular`}
        icon={ShieldCheck}
        title="Admin Users"
        value={adminUsers}
      />
    </>
  );
}
