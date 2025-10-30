import { EndpointStatusChart } from "@/features/overview/components/endpoint-status-chart";
import { EndpointUsageChart } from "@/features/overview/components/endpoint-usage-chart";
import { HttpMethodChart } from "@/features/overview/components/http-method-chart";
import { RecentEndpoints } from "@/features/overview/components/recent-endpoints";
import { ResponseTimeChart } from "@/features/overview/components/response-time-chart";
import { StatsCards } from "@/features/overview/components/stats-cards";

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-bold text-3xl">Overview</h1>
        <p className="text-muted-foreground">
          View your billing simulator statistics and activity
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatsCards />
        <EndpointUsageChart />
        <EndpointStatusChart />
        <HttpMethodChart />
        <ResponseTimeChart />
        <RecentEndpoints />
      </div>
    </div>
  );
}
