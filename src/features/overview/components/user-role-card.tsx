import { ShieldCheck, User } from "@/components/hugeicons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PERCENTAGE_MULTIPLIER = 100;

type UserRoleCardProps = {
  readonly data: OverviewData;
  readonly className?: string;
};

export function UserRoleCard({ data, className }: UserRoleCardProps) {
  if (!data.userStats) {
    return null;
  }

  const totalUsers = data.userStats.totalUsers;
  const roles = [
    {
      icon: ShieldCheck,
      label: messages.overview.userRoleAdmin,
      value: data.userStats.adminUsers,
    },
    {
      icon: User,
      label: messages.overview.userRoleRegular,
      value: data.userStats.regularUsers,
    },
  ];

  return (
    <Card
      className={cn("md:col-span-3 lg:col-span-1", className)}
      variant="overview-card"
    >
      <CardHeader size="chart">
        <CardTitle size="sm">{messages.overview.userRolesTitle}</CardTitle>
        <CardDescription size="xs">
          {messages.overview.userRolesDescription}
        </CardDescription>
      </CardHeader>
      <CardContent
        className="min-h-[260px] justify-center"
        size="overview-role"
      >
        {roles.map((role) => {
          const Icon = role.icon;
          const percentage =
            totalUsers > 0
              ? Math.round((role.value / totalUsers) * PERCENTAGE_MULTIPLIER)
              : 0;

          return (
            <div className="space-y-2" key={role.label}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium text-sm">{role.label}</span>
                </div>
                <span className="font-mono text-sm tabular-nums">
                  {role.value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full w-[var(--percentage)] rounded-full bg-primary"
                  // SAFETY: CSS custom property for dynamic progress width
                  style={
                    { "--percentage": `${percentage}%` } as React.CSSProperties
                  }
                />
              </div>
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatMessage(messages.overview.userPercentageDescription, {
                  percentage,
                })}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
