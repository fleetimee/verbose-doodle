import { motion } from "motion/react";
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
      className={`grid grid-cols-1 gap-4 lg:gap-5 ${isAdmin ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`}
    >
      <StatsCardSkeleton className="md:col-span-2" />

      <StatsCardSkeleton className="md:col-span-1" />
      <StatsCardSkeleton className="md:col-span-1" />
      <StatsCardSkeleton className="md:col-span-1" />

      {isAdmin &&
        Array.from({ length: 3 }, (_, i) => i).map((key) => (
          <StatsCardSkeleton
            className="md:col-span-1"
            key={`user-stats-skeleton-${key + 1}`}
          />
        ))}

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

      {isAdmin && <ChartCardSkeleton className="md:col-span-3 lg:col-span-1" />}

      <RecentEndpointsSkeleton
        className={isAdmin ? "md:col-span-3 lg:col-span-4" : "md:col-span-3"}
      />
    </div>
  );
}

function OverviewContentGrid({
  isAdmin,
  data,
}: OverviewGridProps & { data: OverviewData }) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={`grid grid-cols-1 gap-4 lg:gap-5 ${isAdmin ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-3"}`}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
      <RecentEndpoints
        className={isAdmin ? "md:col-span-3 lg:col-span-4" : undefined}
        data={data}
      />
    </motion.div>
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
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 border-border/70 border-b pb-6 md:grid-cols-[minmax(0,1fr)_auto]"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div>
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Billing Simulator
          </p>
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">
            Overview
          </h1>
          <p className="mt-3 max-w-[62ch] break-words text-muted-foreground text-sm leading-relaxed md:text-base">
            Inspect endpoint coverage, response templates, and account activity
            without leaving the simulator workspace.
          </p>
        </div>
        <div className="flex items-end md:justify-end">
          <div className="rounded-full border border-border/70 bg-card px-4 py-2 font-medium text-muted-foreground text-xs shadow-[0_12px_30px_-24px_color-mix(in_oklab,var(--foreground)_55%,transparent)]">
            Read-only analytics
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-destructive/25 bg-destructive/10 p-4"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-medium text-destructive text-sm">
            Failed to load overview data. Please try refreshing the page.
          </p>
        </motion.div>
      )}

      {isLoading && <OverviewLoadingGrid isAdmin={isAdmin} />}
      {!isLoading && data && (
        <OverviewContentGrid data={data} isAdmin={isAdmin} />
      )}
    </div>
  );
}
