import { motion, useReducedMotion } from "motion/react";
import { CircleAlert, RefreshCw } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context";
import { ChartCardSkeleton } from "@/features/overview/components/chart-card-skeleton";
import { EndpointStatusChart } from "@/features/overview/components/endpoint-status-chart";
import { EndpointsByBillerChart } from "@/features/overview/components/endpoints-by-biller-chart";
import { HttpMethodChart } from "@/features/overview/components/http-method-chart";
import { RecentEndpoints } from "@/features/overview/components/recent-endpoints";
import { RecentEndpointsSkeleton } from "@/features/overview/components/recent-endpoints-skeleton";
import { StatsCardSkeleton } from "@/features/overview/components/stats-card-skeleton";
import { StatsCards } from "@/features/overview/components/stats-cards";
import { UserRoleCard } from "@/features/overview/components/user-role-card";
import { UserStatsCards } from "@/features/overview/components/user-stats-cards";
import { UserStatusChart } from "@/features/overview/components/user-status-chart";
import { useGetOverview } from "@/features/overview/hooks/use-get-overview";
import type { OverviewData } from "@/features/overview/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

type OverviewGridProps = {
  isAdmin: boolean;
};

type OverviewSectionHeadingProps = {
  id: string;
  title: string;
  description: string;
};

function OverviewSectionHeading({
  id,
  title,
  description,
}: OverviewSectionHeadingProps) {
  return (
    <div className="border-border/60 border-b pb-3">
      <h2 className="font-semibold text-lg tracking-tight" id={id}>
        {title}
      </h2>
      <p className="mt-1 max-w-[68ch] text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function OverviewLoadingGrid({ isAdmin }: OverviewGridProps) {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="overview-coverage-heading"
        className="space-y-4"
      >
        <OverviewSectionHeading
          description={messages.overview.coverageDescription}
          id="overview-coverage-heading"
          title={messages.overview.coverageTitle}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <StatsCardSkeleton key={`coverage-skeleton-${index + 1}`} />
          ))}
        </div>
      </section>

      {isAdmin && (
        <section
          aria-labelledby="overview-account-heading"
          className="space-y-4"
        >
          <OverviewSectionHeading
            description={messages.overview.accountActivityDescription}
            id="overview-account-heading"
            title={messages.overview.accountActivityTitle}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
            {Array.from({ length: 3 }, (_, index) => (
              <StatsCardSkeleton key={`account-skeleton-${index + 1}`} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="overview-signal-heading" className="space-y-4">
        <OverviewSectionHeading
          description={messages.overview.configurationSignalDescription}
          id="overview-signal-heading"
          title={messages.overview.configurationSignalTitle}
        />
        <div
          className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <ChartCardSkeleton
            className={isAdmin ? "lg:col-span-2" : undefined}
          />
          <ChartCardSkeleton
            className={isAdmin ? "lg:col-span-2" : undefined}
          />
          <ChartCardSkeleton
            className={isAdmin ? "lg:col-span-2" : undefined}
          />
          {isAdmin && (
            <ChartCardSkeleton className="md:col-span-2 lg:col-span-1" />
          )}
          {isAdmin && (
            <ChartCardSkeleton className="md:col-span-2 lg:col-span-1" />
          )}
        </div>
      </section>

      <RecentEndpointsSkeleton />
    </div>
  );
}

function OverviewContentGrid({
  isAdmin,
  data,
}: OverviewGridProps & { data: OverviewData }) {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="overview-coverage-heading"
        className="space-y-4"
      >
        <OverviewSectionHeading
          description={messages.overview.coverageDescription}
          id="overview-coverage-heading"
          title={messages.overview.coverageTitle}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          <StatsCards data={data} />
        </div>
      </section>

      {isAdmin && data.userStats && (
        <section
          aria-labelledby="overview-account-heading"
          className="space-y-4"
        >
          <OverviewSectionHeading
            description={messages.overview.accountActivityDescription}
            id="overview-account-heading"
            title={messages.overview.accountActivityTitle}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5">
            <UserStatsCards data={data} />
          </div>
        </section>
      )}

      <section aria-labelledby="overview-signal-heading" className="space-y-4">
        <OverviewSectionHeading
          description={messages.overview.configurationSignalDescription}
          id="overview-signal-heading"
          title={messages.overview.configurationSignalTitle}
        />
        <div
          className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          <HttpMethodChart
            className={
              isAdmin
                ? "md:col-span-1 lg:col-span-2"
                : "md:col-span-1 lg:col-span-1"
            }
            data={data}
          />
          <EndpointStatusChart
            className={
              isAdmin
                ? "md:col-span-1 lg:col-span-2"
                : "md:col-span-1 lg:col-span-1"
            }
            data={data}
          />
          <EndpointsByBillerChart
            className={
              isAdmin
                ? "md:col-span-1 lg:col-span-2"
                : "md:col-span-1 lg:col-span-1"
            }
            data={data}
          />
          {isAdmin && data.userStatusDistribution && (
            <UserStatusChart
              className="md:col-span-2 lg:col-span-1"
              data={data}
            />
          )}
          {isAdmin && data.userStats && (
            <UserRoleCard className="md:col-span-2 lg:col-span-1" data={data} />
          )}
        </div>
      </section>

      <RecentEndpoints data={data} />
    </div>
  );
}

export function OverviewPage() {
  const { snapshot } = useAuth();
  const isAdmin = snapshot.user?.role === "ADMIN";
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch, isFetching } = useGetOverview();

  useDocumentMeta({
    description: messages.overview.documentDescription,
    keywords: [
      "dashboard",
      "overview",
      "billing simulator",
      "endpoints",
      "responses",
    ],
    title: messages.overview.documentTitle,
  });

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-5 border-border/70 border-b pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        initial={{
          opacity: prefersReducedMotion ? 1 : 0,
          y: prefersReducedMotion ? 0 : -8,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.35,
          ease: "easeOut",
        }}
      >
        <div>
          <h1 className="text-balance font-bold text-4xl tracking-tight md:text-5xl">
            {messages.overview.pageTitle}
          </h1>
          <p className="mt-3 max-w-[68ch] break-words text-muted-foreground text-sm leading-relaxed md:text-base">
            {messages.overview.pageDescription}
          </p>
        </div>
        <div className="flex md:justify-end">
          <div className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 font-medium text-muted-foreground text-xs shadow-xs">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            <span>{messages.overview.eyebrow}</span>
            <span aria-hidden className="text-border">
              /
            </span>
            <span>{messages.overview.readOnlyAnalytics}</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-lg border border-destructive/25 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          initial={{
            opacity: prefersReducedMotion ? 1 : 0,
            y: prefersReducedMotion ? 0 : 8,
          }}
          role="alert"
          transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        >
          <div className="flex items-start gap-3">
            <CircleAlert
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-destructive"
            />
            <p className="font-medium text-destructive text-sm leading-relaxed">
              {messages.overview.loadError}
            </p>
          </div>
          <Button
            className="self-start sm:self-auto"
            disabled={isFetching}
            onClick={() => refetch()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw
              aria-hidden
              className={isFetching ? "animate-spin" : undefined}
            />
            {messages.overview.retry}
          </Button>
        </motion.div>
      )}

      {isLoading && <OverviewLoadingGrid isAdmin={isAdmin} />}
      {!isLoading && data && (
        <OverviewContentGrid data={data} isAdmin={isAdmin} />
      )}
    </div>
  );
}
