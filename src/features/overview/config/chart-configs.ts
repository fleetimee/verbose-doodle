import type { ChartConfig } from "@/components/ui/chart";
import { messages } from "@/lib/i18n";

/**
 * Chart configuration for endpoint usage trend
 */
export const endpointUsageConfig = {
  requests: {
    label: messages.overview.chartLabels.totalRequests,
    color: "var(--chart-1)",
  },
  success: {
    label: messages.overview.chartLabels.successful,
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/**
 * Chart configuration for HTTP method distribution
 */
export const methodDistributionConfig = {
  get: {
    label: "GET",
    color: "var(--chart-1)",
  },
  post: {
    label: "POST",
    color: "var(--chart-2)",
  },
  put: {
    label: "PUT",
    color: "var(--chart-3)",
  },
  delete: {
    label: "DELETE",
    color: "var(--chart-4)",
  },
  patch: {
    label: "PATCH",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

/**
 * Chart configuration for response time trends
 */
export const responseTimeConfig = {
  avgResponseTime: {
    label: messages.overview.chartLabels.avgResponseTime,
    color: "var(--chart-1)",
  },
  p95ResponseTime: {
    label: messages.overview.chartLabels.p95ResponseTime,
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/**
 * Chart configuration for endpoint status distribution
 */
export const endpointStatusConfig = {
  active: {
    label: messages.overview.chartLabels.active,
    color: "var(--chart-2)",
  },
  inactive: {
    label: messages.overview.chartLabels.inactive,
    color: "var(--chart-3)",
  },
  deprecated: {
    label: messages.overview.chartLabels.deprecated,
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;
