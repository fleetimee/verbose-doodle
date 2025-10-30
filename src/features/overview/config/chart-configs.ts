import type { ChartConfig } from "@/components/ui/chart";

/**
 * Chart configuration for endpoint usage trend
 */
export const endpointUsageConfig = {
  requests: {
    label: "Total Requests",
    color: "var(--chart-1)",
  },
  success: {
    label: "Successful",
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
    label: "Avg Response Time",
    color: "var(--chart-1)",
  },
  p95ResponseTime: {
    label: "P95 Response Time",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

/**
 * Chart configuration for endpoint status distribution
 */
export const endpointStatusConfig = {
  active: {
    label: "Active",
    color: "var(--chart-2)",
  },
  inactive: {
    label: "Inactive",
    color: "var(--chart-3)",
  },
  deprecated: {
    label: "Deprecated",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;
