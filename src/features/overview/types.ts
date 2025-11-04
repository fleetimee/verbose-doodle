/**
 * Overview feature type definitions
 */

import type { HttpMethod } from "@/features/endpoints/types";

/**
 * Overview statistics
 */
export type OverviewStats = {
  totalEndpoints: number;
  totalResponses: number;
  activeResponses: number;
  activeResponsesPercentage: string;
  totalBillers: number;
  endpointsWithoutResponses: number;
};

/**
 * HTTP method distribution
 */
export type MethodDistribution = {
  method: HttpMethod;
  count: number;
};

/**
 * Endpoints grouped by biller
 */
export type EndpointsByBiller = {
  billerName: string;
  endpointCount: number;
};

/**
 * Response status code distribution
 */
export type ResponseStatusDistribution = {
  statusCode: number;
  label: string;
  count: number;
};

/**
 * Response activation status
 */
export type ResponseActivation = {
  active: number;
  inactive: number;
};

/**
 * Recent endpoint item
 */
export type RecentEndpoint = {
  endpointId: number;
  url: string;
  method: HttpMethod;
  billerName: string;
  responseCount: number;
};

/**
 * User statistics (ADMIN only)
 */
export type UserStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
};

/**
 * User status distribution (ADMIN only)
 */
export type UserStatusDistribution = {
  status: "active" | "inactive";
  count: number;
};

/**
 * User role distribution (ADMIN only)
 */
export type UserRoleDistribution = {
  role: "ADMIN" | "USER";
  count: number;
};

/**
 * Complete overview data
 */
export type OverviewData = {
  stats: OverviewStats;
  methodDistribution: MethodDistribution[];
  endpointsByBiller: EndpointsByBiller[];
  responseStatusDistribution: ResponseStatusDistribution[];
  responseActivation: ResponseActivation;
  recentEndpoints: RecentEndpoint[];
  userStats?: UserStats;
  userStatusDistribution?: UserStatusDistribution[];
  userRoleDistribution?: UserRoleDistribution[];
};

/**
 * Raw API response for overview
 */
export type ApiOverviewResponse = {
  responseCode: string;
  responseDesc: string;
  data: OverviewData;
};

/**
 * Overview error response
 */
export type OverviewError = {
  message: string;
  code?: string;
  status?: number;
};
