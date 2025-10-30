import { Activity, Globe, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overviewStats } from "@/features/overview/data/overview-data";

export function StatsCards() {
  return (
    <>
      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Endpoints</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {overviewStats.totalEndpoints}
          </div>
          <p className="text-muted-foreground text-xs">
            <span className="text-green-600">
              {overviewStats.totalEndpointsChange}
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{overviewStats.totalUsers}</div>
          <p className="text-muted-foreground text-xs">
            <span className="text-green-600">
              {overviewStats.totalUsersChange}
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Active Endpoints
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {overviewStats.activeEndpoints}
          </div>
          <p className="text-muted-foreground text-xs">
            {overviewStats.activeEndpointsPercentage} of total endpoints
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Requests</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {overviewStats.totalRequests}
          </div>
          <p className="text-muted-foreground text-xs">
            <span className="text-green-600">
              {overviewStats.totalRequestsChange}
            </span>{" "}
            from last month
          </p>
        </CardContent>
      </Card>
    </>
  );
}
