import { ShieldCheck, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";

const PERCENTAGE_MULTIPLIER = 100;

type UserRoleCardProps = {
  readonly data: OverviewData;
};

export function UserRoleCard({ data }: UserRoleCardProps) {
  if (!data.userStats) {
    return null;
  }

  const totalUsers = data.userStats.totalUsers;
  const roles = [
    {
      label: "Admin",
      value: data.userStats.adminUsers,
      icon: ShieldCheck,
    },
    {
      label: "Regular",
      value: data.userStats.regularUsers,
      icon: User,
    },
  ];

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] md:col-span-3 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">User Roles</CardTitle>
        <CardDescription className="text-xs">
          Admin and regular account split
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[260px] flex-col justify-center gap-5">
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
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs tabular-nums">
                {percentage}% of users
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
