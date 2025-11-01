/**
 * Static data for HTTP method distribution
 * Based on the actual endpoints configured in the system
 */
export const methodDistributionData = [
  { method: "GET", count: 8, fill: "var(--color-get)" },
  { method: "POST", count: 12, fill: "var(--color-post)" },
  { method: "PUT", count: 3, fill: "var(--color-put)" },
  { method: "DELETE", count: 2, fill: "var(--color-delete)" },
  { method: "PATCH", count: 1, fill: "var(--color-patch)" },
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
  { status: "200", label: "Success", count: 18, fill: "var(--color-200)" },
  { status: "400", label: "Bad Request", count: 6, fill: "var(--color-400)" },
  { status: "500", label: "Server Error", count: 4, fill: "var(--color-500)" },
  { status: "404", label: "Not Found", count: 2, fill: "var(--color-404)" },
];

/**
 * Static data for response activation status
 * Shows how many responses are activated vs inactive
 */
export const responseActivationData = [
  { status: "active", count: 26, fill: "var(--chart-2)" },
  { status: "inactive", count: 4, fill: "var(--chart-3)" },
];

/**
 * Recent endpoints data
 * Shows recently configured endpoints in the system
 */
export const recentEndpointsData = [
  {
    id: "1",
    url: "/real/endpoint/used/123",
    method: "GET" as const,
    biller: "BCA",
    responsesCount: 2,
  },
  {
    id: "2",
    url: "/real/actually/add",
    method: "POST" as const,
    biller: "BCA",
    responsesCount: 0,
  },
  {
    id: "3",
    url: "/api/payment/inquiry",
    method: "POST" as const,
    biller: "Mandiri",
    responsesCount: 3,
  },
  {
    id: "4",
    url: "/api/payment/confirm",
    method: "POST" as const,
    biller: "Mandiri",
    responsesCount: 2,
  },
  {
    id: "5",
    url: "/api/transaction/status",
    method: "GET" as const,
    biller: "BNI",
    responsesCount: 1,
  },
];

/**
 * Overview statistics based on actual database schema
 * Billers, Endpoints, Responses tables
 */
export const overviewStats = {
  totalEndpoints: 26,
  totalResponses: 30,
  activeResponses: 26,
  activeResponsesPercentage: "87%",
  totalBillers: 4,
  endpointsWithoutResponses: 2,
};

/**
 * User statistics (ADMIN only)
 * Based on Users table
 */
export const userStats = {
  totalUsers: 8,
  activeUsers: 6,
  inactiveUsers: 2,
  adminUsers: 2,
  regularUsers: 6,
};

/**
 * User status distribution (ADMIN only)
 * Shows active vs inactive users
 */
export const userStatusData = [
  { status: "active", count: 6, fill: "var(--color-active)" },
  { status: "inactive", count: 2, fill: "var(--color-inactive)" },
];

/**
 * User role distribution (ADMIN only)
 * Shows admin vs regular users
 */
export const userRoleData = [
  { role: "ADMIN", count: 2, fill: "var(--chart-1)" },
  { role: "USER", count: 6, fill: "var(--chart-2)" },
];
