import { Activity, Building2, FileJson, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overviewStats } from "@/features/overview/data/overview-data";

export function StatsCards() {
  return (
    <>
      {/* Feature Card - Total Endpoints with split layout */}
      <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background transition-all hover:border-primary/40 hover:shadow-lg md:col-span-2 lg:row-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-base">
            Total Endpoints
          </CardTitle>
          <div className="rounded-full bg-primary/10 p-2.5 transition-transform group-hover:scale-110">
            <Globe className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-bold text-5xl tracking-tight">
            {overviewStats.totalEndpoints}
          </div>
          <p className="text-muted-foreground">
            Configured endpoint routes across all billers
          </p>
        </CardContent>
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-8 translate-y-[-50%] rounded-full bg-primary/5 blur-3xl" />
      </Card>

      {/* Compact Card - Total Responses */}
      <Card className="group relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background transition-all hover:border-blue-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Total Responses
          </CardTitle>
          <div className="rounded-full bg-blue-500/10 p-2 transition-transform group-hover:scale-110">
            <FileJson className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">
            {overviewStats.totalResponses}
          </div>
          <p className="text-muted-foreground text-xs">
            Response templates
          </p>
        </CardContent>
      </Card>

      {/* Compact Card - Active Responses */}
      <Card className="group relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/5 via-background to-background transition-all hover:border-green-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">
            Active Responses
          </CardTitle>
          <div className="rounded-full bg-green-500/10 p-2 transition-transform group-hover:scale-110">
            <Activity className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="font-bold text-3xl">
              {overviewStats.activeResponses}
            </div>
            <div className="font-semibold text-green-600 text-lg dark:text-green-400">
              {overviewStats.activeResponsesPercentage}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Active templates
          </p>
        </CardContent>
      </Card>

      {/* Compact Card - Total Billers */}
      <Card className="group relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-background to-background transition-all hover:border-purple-500/40 hover:shadow-lg md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Billers</CardTitle>
          <div className="rounded-full bg-purple-500/10 p-2 transition-transform group-hover:scale-110">
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-bold text-3xl">
            {overviewStats.totalBillers}
          </div>
          <p className="text-muted-foreground text-xs">
            Biller systems
          </p>
        </CardContent>
      </Card>
    </>
  );
}
