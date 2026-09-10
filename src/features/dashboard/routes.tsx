import { Navigate, Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { developerToolRoutes } from "@/features/developer-tools/routes";
import { endpointRoutes } from "@/features/endpoints/routes";
import { overviewRoutes } from "@/features/overview/routes";
import { socketTesterRoutes } from "@/features/socket-tester/routes";
import { socksRelayRoutes } from "@/features/socks-relay/routes";

export const dashboardRoutes = (
  <Route
    element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }
    path="/dashboard"
  >
    <Route element={<Navigate replace to="/dashboard/overview" />} index />
    {overviewRoutes}
    {endpointRoutes}
    {socketTesterRoutes}
    {developerToolRoutes}
    {socksRelayRoutes}
    <Route
      element={<Navigate replace to="/dashboard/overview" />}
      path="users"
    />
  </Route>
);
