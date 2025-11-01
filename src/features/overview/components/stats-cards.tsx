import { Activity, Building2, FileJson, Globe } from "lucide-react";
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
            Configured endpoint routes
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Responses</CardTitle>
          <FileJson className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {overviewStats.totalResponses}
          </div>
          <p className="text-muted-foreground text-xs">
            Configured response templates
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Active Responses
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">
            {overviewStats.activeResponses}
          </div>
          <p className="text-muted-foreground text-xs">
            {overviewStats.activeResponsesPercentage} of total responses
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Billers</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{overviewStats.totalBillers}</div>
          <p className="text-muted-foreground text-xs">
            Configured biller systems
          </p>
        </CardContent>
      </Card>
    </>
  );
}
