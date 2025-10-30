/**
 * Static data for endpoint usage over time
 */
export const endpointUsageData = [
  { month: "Jan", requests: 186, success: 175 },
  { month: "Feb", requests: 305, success: 290 },
  { month: "Mar", requests: 237, success: 220 },
  { month: "Apr", requests: 273, success: 265 },
  { month: "May", requests: 309, success: 298 },
  { month: "Jun", requests: 414, success: 400 },
];

/**
 * Static data for HTTP method distribution
 */
export const methodDistributionData = [
  { method: "GET", count: 450, fill: "var(--color-get)" },
  { method: "POST", count: 320, fill: "var(--color-post)" },
  { method: "PUT", count: 180, fill: "var(--color-put)" },
  { method: "DELETE", count: 95, fill: "var(--color-delete)" },
  { method: "PATCH", count: 60, fill: "var(--color-patch)" },
];

/**
 * Static data for response time trends (area chart)
 */
export const responseTimeData = [
  { date: "Jan 01", avgResponseTime: 120, p95ResponseTime: 250 },
  { date: "Jan 08", avgResponseTime: 132, p95ResponseTime: 280 },
  { date: "Jan 15", avgResponseTime: 145, p95ResponseTime: 310 },
  { date: "Jan 22", avgResponseTime: 128, p95ResponseTime: 265 },
  { date: "Jan 29", avgResponseTime: 118, p95ResponseTime: 245 },
  { date: "Feb 05", avgResponseTime: 125, p95ResponseTime: 270 },
  { date: "Feb 12", avgResponseTime: 115, p95ResponseTime: 240 },
  { date: "Feb 19", avgResponseTime: 110, p95ResponseTime: 230 },
  { date: "Feb 26", avgResponseTime: 108, p95ResponseTime: 225 },
  { date: "Mar 05", avgResponseTime: 105, p95ResponseTime: 220 },
];

/**
 * Static data for endpoint status distribution (pie chart)
 */
export const endpointStatusData = [
  { status: "active", count: 18, fill: "var(--color-active)" },
  { status: "inactive", count: 4, fill: "var(--color-inactive)" },
  { status: "deprecated", count: 2, fill: "var(--color-deprecated)" },
];

/**
 * Recent endpoints data
 */
export const recentEndpointsData = [
  {
    id: "1",
    name: "/api/v1/billing/invoice",
    method: "POST" as const,
    date: "2 hours ago",
  },
  {
    id: "2",
    name: "/api/v1/users/profile",
    method: "GET" as const,
    date: "5 hours ago",
  },
  {
    id: "3",
    name: "/api/v1/payments/process",
    method: "POST" as const,
    date: "1 day ago",
  },
  {
    id: "4",
    name: "/api/v1/subscriptions",
    method: "GET" as const,
    date: "2 days ago",
  },
  {
    id: "5",
    name: "/api/v1/billing/history",
    method: "GET" as const,
    date: "3 days ago",
  },
];

/**
 * Overview statistics
 */
export const overviewStats = {
  totalEndpoints: 24,
  totalEndpointsChange: "+3",
  totalUsers: 156,
  totalUsersChange: "+12",
  activeEndpoints: 18,
  activeEndpointsPercentage: "75%",
  totalRequests: "1,724",
  totalRequestsChange: "+20.1%",
};
