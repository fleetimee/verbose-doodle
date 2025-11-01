import { ShieldCheck, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userStats } from "@/features/overview/data/overview-data";

export function UserStatsCards() {
  return (
    <>
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{userStats.totalUsers}</div>
          <p className="text-muted-foreground text-xs">
            Registered user accounts
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{userStats.activeUsers}</div>
          <p className="text-muted-foreground text-xs">
            {userStats.inactiveUsers} inactive users
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Admin Users</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{userStats.adminUsers}</div>
          <p className="text-muted-foreground text-xs">
            {userStats.regularUsers} regular users
          </p>
        </CardContent>
      </Card>
    </>
  );
}
