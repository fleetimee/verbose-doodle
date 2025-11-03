import { useEffect, useState } from "react";
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
import { useDocumentMeta } from "@/hooks/use-document-meta";

const SKELETON_KEYS = Array.from({ length: 4 }, (_, i) => i);
const LOADING_DELAY_MS = 800;

export function OverviewPage() {
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === "ADMIN";
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-bold text-3xl">Overview</h1>
        <p className="break-words text-muted-foreground">
          View your billing simulator configuration and statistics
        </p>
      </div>

      {/* Bento Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {/* Stats Cards Skeletons */}
          {SKELETON_KEYS.map((key) => (
            <StatsCardSkeleton key={`stats-skeleton-${key + 1}`} />
          ))}

          {/* Admin User Stats Cards Skeletons */}
          {isAdmin &&
            Array.from({ length: 3 }, (_, i) => i).map((key) => (
              <StatsCardSkeleton key={`user-stats-skeleton-${key + 1}`} />
            ))}

          {/* Chart Skeletons */}
          <ChartCardSkeleton className="md:col-span-2 lg:col-span-2" />
          <ChartCardSkeleton className="md:col-span-1 lg:col-span-2" />
          <ChartCardSkeleton className="md:col-span-2 lg:col-span-2" />

          {/* Admin User Status Chart Skeleton */}
          {isAdmin && (
            <ChartCardSkeleton className="md:col-span-1 lg:col-span-2" />
          )}

          {/* Recent Endpoints Skeleton */}
          <RecentEndpointsSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatsCards />
          {isAdmin && <UserStatsCards />}
          <HttpMethodChart />
          <EndpointStatusChart />
          <EndpointsByBillerChart />
          {isAdmin && <UserStatusChart />}
          <RecentEndpoints />
        </div>
      )}
    </div>
  );
}
