import type { ChartConfig } from "@/components/ui/chart";
import { messages } from "@/lib/i18n";

/**
 * Chart configuration for endpoint usage trend
 */
export const endpointUsageConfig = {
  requests: {
    color: "var(--chart-1)",
    label: messages.overview.chartLabels.totalRequests,
  },
  success: {
    color: "var(--chart-2)",
    label: messages.overview.chartLabels.successful,
  },
} satisfies ChartConfig;

/**
 * Chart configuration for HTTP method distribution
 */
export const methodDistributionConfig = {
  delete: {
    color: "var(--chart-4)",
    label: "DELETE",
  },
  get: {
    color: "var(--chart-1)",
    label: "GET",
  },
  patch: {
    color: "var(--chart-5)",
    label: "PATCH",
  },
  post: {
    color: "var(--chart-2)",
    label: "POST",
  },
  put: {
    color: "var(--chart-3)",
    label: "PUT",
  },
} satisfies ChartConfig;

/**
 * Chart configuration for response time trends
 */
export const responseTimeConfig = {
  avgResponseTime: {
    color: "var(--chart-1)",
    label: messages.overview.chartLabels.avgResponseTime,
  },
  p95ResponseTime: {
    color: "var(--chart-2)",
    label: messages.overview.chartLabels.p95ResponseTime,
  },
} satisfies ChartConfig;

/**
 * Chart configuration for endpoint status distribution
 */
export const endpointStatusConfig = {
  active: {
    color: "var(--chart-2)",
    label: messages.overview.chartLabels.active,
  },
  deprecated: {
    color: "var(--chart-4)",
    label: messages.overview.chartLabels.deprecated,
  },
  inactive: {
    color: "var(--chart-3)",
    label: messages.overview.chartLabels.inactive,
  },
} satisfies ChartConfig;
