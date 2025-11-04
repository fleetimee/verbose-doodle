import { useAuth } from "@/features/auth/context";
import { ChartCardSkeleton } from "@/features/overview/components/chart-card-skeleton";
import { EndpointStatusChart } from "@/features/overview/components/endpoint-status-chart";
import { EndpointsByBillerChart } from "@/features/overview/components/endpoints-by-biller-chart";
import { HttpMethodChart } from "@/features/overview/components/http-method-chart";
import { RecentEndpoints } from "@/features/overview/components/recent-endpoints";
import { RecentEndpointsSkeleton } from "@/features/overview/components/recent-endpoints-skeleton";
import { StatsCardSkeleton } from "@/features/overview/components/stats-card-skeleton";
import { StatsCards } from "@/features/overview/components/stats-cards";
import { UserStatsCards } from "@/features/overview/components/user-stats-cards";
import { UserStatusChart } from "@/features/overview/components/user-status-chart";
import { useGetOverview } from "@/features/overview/hooks/use-get-overview";
import type { OverviewData } from "@/features/overview/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";

type OverviewGridProps = {
  isAdmin: boolean;
};

function OverviewLoadingGrid({ isAdmin }: OverviewGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${isAdmin ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`}
    >
      {/* Large Feature Card - Total Endpoints (2 cols × 2 rows) */}
      <StatsCardSkeleton className="md:col-span-2 lg:row-span-2" />

      {/* Three compact stats cards stacked vertically */}
      <StatsCardSkeleton className="md:col-span-1" />
      <StatsCardSkeleton className="md:col-span-1" />
      <StatsCardSkeleton className="md:col-span-1" />

      {/* Admin User Stats Cards Skeletons */}
      {isAdmin &&
        Array.from({ length: 3 }, (_, i) => i).map((key) => (
          <StatsCardSkeleton
            className="md:col-span-1"
            key={`user-stats-skeleton-${key + 1}`}
          />
        ))}

      {/* Chart Skeletons */}
      <ChartCardSkeleton
        className={
          isAdmin
            ? "md:col-span-2 lg:col-span-2"
            : "md:col-span-3 lg:col-span-3"
        }
      />
      <ChartCardSkeleton
        className={
          isAdmin
            ? "md:col-span-1 lg:col-span-2"
            : "md:col-span-3 lg:col-span-3"
        }
      />
      <ChartCardSkeleton
        className={
          isAdmin
            ? "md:col-span-2 lg:col-span-2"
            : "md:col-span-3 lg:col-span-3"
        }
      />

      {/* Admin User Status Chart Skeleton (1 col × 2 rows) */}
      {isAdmin && (
        <ChartCardSkeleton className="md:col-span-3 lg:col-span-1 lg:row-span-2" />
      )}

      {/* Recent Endpoints Skeleton (3 cols) */}
      <RecentEndpointsSkeleton
        className={isAdmin ? "md:col-span-3 lg:col-span-3" : "md:col-span-3"}
      />
    </div>
  );
}

function OverviewContentGrid({
  isAdmin,
  data,
}: OverviewGridProps & { data: OverviewData }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${isAdmin ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`}
    >
      <StatsCards data={data} />
      {isAdmin && data.userStats && <UserStatsCards data={data} />}
      <HttpMethodChart
        className={isAdmin ? undefined : "md:col-span-3 lg:col-span-3"}
        data={data}
      />
      <EndpointStatusChart
        className={isAdmin ? undefined : "md:col-span-3 lg:col-span-3"}
        data={data}
      />
      <EndpointsByBillerChart
        className={isAdmin ? undefined : "md:col-span-3 lg:col-span-3"}
        data={data}
      />
      {isAdmin && data.userStatusDistribution && (
        <UserStatusChart data={data} />
      )}
      <RecentEndpoints data={data} />
    </div>
  );
}

export function OverviewPage() {
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";
  const { data, isLoading, error } = useGetOverview();

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

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-600 dark:text-red-400">
            Failed to load overview data. Please try refreshing the page.
          </p>
        </div>
      )}

      {/* Bento Grid Layout */}
      {isLoading && <OverviewLoadingGrid isAdmin={isAdmin} />}
      {!isLoading && data && (
        <OverviewContentGrid data={data} isAdmin={isAdmin} />
      )}
    </div>
  );
}
