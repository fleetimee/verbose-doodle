import { useAuth } from "@/features/auth/context";
import { EndpointStatusChart } from "@/features/overview/components/endpoint-status-chart";
import { EndpointsByBillerChart } from "@/features/overview/components/endpoints-by-biller-chart";
import { HttpMethodChart } from "@/features/overview/components/http-method-chart";
import { RecentEndpoints } from "@/features/overview/components/recent-endpoints";
import { StatsCards } from "@/features/overview/components/stats-cards";
import { UserStatsCards } from "@/features/overview/components/user-stats-cards";
import { UserStatusChart } from "@/features/overview/components/user-status-chart";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function OverviewPage() {
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";

  useDocumentMeta({
    title: "Overview",
    description:
      "View your billing simulator statistics, configured endpoints, and response distributions",
    keywords: [
      "dashboard",
      "overview",
      "billing simulator",
      "endpoints",
      "responses",
    ],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-bold text-3xl">Overview</h1>
        <p className="break-words text-muted-foreground">
          View your billing simulator configuration and statistics
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatsCards />
        {isAdmin && <UserStatsCards />}
        <HttpMethodChart />
        <EndpointStatusChart />
        <EndpointsByBillerChart />
        {isAdmin && <UserStatusChart />}
        <RecentEndpoints />
      </div>
    </div>
  );
}
