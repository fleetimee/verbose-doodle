import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userStats } from "@/features/overview/data/overview-data";

export function UserStatsCards() {
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
          <div className="font-bold text-3xl">{userStats.totalUsers}</div>
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
          <div className="font-bold text-3xl">{userStats.activeUsers}</div>
          <p className="text-muted-foreground text-xs">
            {userStats.inactiveUsers} inactive
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
          <div className="font-bold text-3xl">{userStats.adminUsers}</div>
          <p className="text-muted-foreground text-xs">
            {userStats.regularUsers} regular
          </p>
        </CardContent>
      </Card>
    </>
  );
}
