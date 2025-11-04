import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewData } from "@/features/overview/types";

type UserStatsCardsProps = {
  data: OverviewData;
};

export function UserStatsCards({ data }: UserStatsCardsProps) {
  // Early return if no user stats available
  if (!data.userStats) {
    return null;
  }

  const { totalUsers, activeUsers, inactiveUsers, adminUsers, regularUsers } =
    data.userStats;

  return (
    <>
      {/* Compact Card - Total Users */}
      <Card className="group relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-background transition-all hover:border-orange-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          <div className="rounded-full bg-orange-500/10 p-2 transition-transform group-hover:scale-110">
            <Users className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">{totalUsers}</div>
          <p className="text-muted-foreground text-xs">Registered accounts</p>
        </CardContent>
      </Card>

      {/* Compact Card - Active Users */}
      <Card className="group relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-background transition-all hover:border-cyan-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Active Users</CardTitle>
          <div className="rounded-full bg-cyan-500/10 p-2 transition-transform group-hover:scale-110">
            <UserCheck className="h-4 w-4 text-cyan-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">{activeUsers}</div>
          <p className="text-muted-foreground text-xs">
            {inactiveUsers} inactive
          </p>
        </CardContent>
      </Card>

      {/* Compact Card - Admin Users */}
      <Card className="group relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-background transition-all hover:border-amber-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Admin Users</CardTitle>
          <div className="rounded-full bg-amber-500/10 p-2 transition-transform group-hover:scale-110">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">{adminUsers}</div>
          <p className="text-muted-foreground text-xs">
            {regularUsers} regular
          </p>
        </CardContent>
      </Card>
    </>
  );
}
