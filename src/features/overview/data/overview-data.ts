/**
 * Static data for HTTP method distribution
 * Based on the actual endpoints configured in the system
 */
export const methodDistributionData = [
  { count: 8, fill: "var(--color-get)", method: "GET" },
  { count: 12, fill: "var(--color-post)", method: "POST" },
  { count: 3, fill: "var(--color-put)", method: "PUT" },
  { count: 2, fill: "var(--color-delete)", method: "DELETE" },
  { count: 1, fill: "var(--color-patch)", method: "PATCH" },
];

/**
 * Static data for endpoints by biller
 * Shows how many endpoints each biller has
 */
export const endpointsByBillerData = [
  { biller: "BCA", count: 8, fill: "var(--color-BCA)" },
  { biller: "Mandiri", count: 7, fill: "var(--color-Mandiri)" },
  { biller: "BNI", count: 6, fill: "var(--color-BNI)" },
  { biller: "BRI", count: 5, fill: "var(--color-BRI)" },
];

/**
 * Static data for responses by HTTP status code
 * Shows distribution of configured response status codes
 */
export const responseStatusData = [
  { count: 18, fill: "var(--color-200)", label: "Success", status: "200" },
  { count: 6, fill: "var(--color-400)", label: "Bad Request", status: "400" },
  { count: 4, fill: "var(--color-500)", label: "Server Error", status: "500" },
  { count: 2, fill: "var(--color-404)", label: "Not Found", status: "404" },
];

/**
 * Static data for response activation status
 * Shows how many responses are activated vs inactive
 */
export const responseActivationData = [
  { count: 26, fill: "var(--chart-2)", status: "active" },
  { count: 4, fill: "var(--chart-3)", status: "inactive" },
];

/**
 * Recent endpoints data
 * Shows recently configured endpoints in the system
 */
export const recentEndpointsData = [
  {
    biller: "BCA",
    id: "1",
    method: "GET" as const,
    responsesCount: 2,
    url: "/real/endpoint/used/123",
  },
  {
    biller: "BCA",
    id: "2",
    method: "POST" as const,
    responsesCount: 0,
    url: "/real/actually/add",
  },
  {
    biller: "Mandiri",
    id: "3",
    method: "POST" as const,
    responsesCount: 3,
    url: "/api/payment/inquiry",
  },
  {
    biller: "Mandiri",
    id: "4",
    method: "POST" as const,
    responsesCount: 2,
    url: "/api/payment/confirm",
  },
  {
    biller: "BNI",
    id: "5",
    method: "GET" as const,
    responsesCount: 1,
    url: "/api/transaction/status",
  },
];

/**
 * Overview statistics based on actual database schema
 * Billers, Endpoints, Responses tables
 */
export const overviewStats = {
  activeResponses: 26,
  activeResponsesPercentage: "87%",
  endpointsWithoutResponses: 2,
  totalBillers: 4,
  totalEndpoints: 26,
  totalResponses: 30,
};

/**
 * User statistics (ADMIN only)
 * Based on Users table
 */
export const userStats = {
  activeUsers: 6,
  adminUsers: 2,
  inactiveUsers: 2,
  regularUsers: 6,
  totalUsers: 8,
};

/**
 * User status distribution (ADMIN only)
 * Shows active vs inactive users
 */
export const userStatusData = [
  { count: 6, fill: "var(--color-active)", status: "active" },
  { count: 2, fill: "var(--color-inactive)", status: "inactive" },
];

/**
 * User role distribution (ADMIN only)
 * Shows admin vs regular users
 */
export const userRoleData = [
  { count: 2, fill: "var(--chart-1)", role: "ADMIN" },
  { count: 6, fill: "var(--chart-2)", role: "USER" },
];

/**
 * Endpoint usage trend data
 * Shows total requests and successful responses over the last 6 months
 */
export const endpointUsageData = [
  { month: "Jun", requests: 1240, success: 1186 },
  { month: "Jul", requests: 1580, success: 1512 },
  { month: "Aug", requests: 1820, success: 1764 },
  { month: "Sep", requests: 2140, success: 2076 },
  { month: "Oct", requests: 2450, success: 2388 },
  { month: "Nov", requests: 2680, success: 2614 },
];

/**
 * Response time trends data
 * Shows average and P95 response times (ms) over the last 10 weeks
 */
export const responseTimeData = [
  { avgResponseTime: 142, date: "Week 1", p95ResponseTime: 285 },
  { avgResponseTime: 138, date: "Week 2", p95ResponseTime: 276 },
  { avgResponseTime: 145, date: "Week 3", p95ResponseTime: 290 },
  { avgResponseTime: 152, date: "Week 4", p95ResponseTime: 304 },
  { avgResponseTime: 148, date: "Week 5", p95ResponseTime: 296 },
  { avgResponseTime: 135, date: "Week 6", p95ResponseTime: 270 },
  { avgResponseTime: 140, date: "Week 7", p95ResponseTime: 280 },
  { avgResponseTime: 143, date: "Week 8", p95ResponseTime: 286 },
  { avgResponseTime: 137, date: "Week 9", p95ResponseTime: 274 },
  { avgResponseTime: 141, date: "Week 10", p95ResponseTime: 282 },
];
