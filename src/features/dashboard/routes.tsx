import { Navigate, Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { developerToolRoutes } from "@/features/developer-tools/routes";
import { employeeRoutes } from "@/features/employees/routes";
import { endpointRoutes } from "@/features/endpoints/routes";
import { gameRoutes } from "@/features/games/routes";
import { overviewRoutes } from "@/features/overview/routes";
import { serverInventoryRoutes } from "@/features/server-inventory/routes";
import { simulatorDbRoutes } from "@/features/simulator-db/routes";
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
    {gameRoutes}
    {overviewRoutes}
    {endpointRoutes}
    {serverInventoryRoutes}
    {simulatorDbRoutes}
    {employeeRoutes}
    {socketTesterRoutes}
    {developerToolRoutes}
    {socksRelayRoutes}
    <Route
      element={<Navigate replace to="/dashboard/overview" />}
      path="users"
    />
  </Route>
);
