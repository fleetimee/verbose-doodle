import { lazy } from "react";
import { Navigate, Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { developerToolRoutes } from "@/features/developer-tools/routes";
import { employeeRoutes } from "@/features/employees/routes";
import { endpointRoutes } from "@/features/endpoints/routes";
import { gameRoutes } from "@/features/games/routes";
import { logViewerRoutes } from "@/features/log-viewer/routes";
import { overviewRoutes } from "@/features/overview/routes";
import { serverInventoryRoutes } from "@/features/server-inventory/routes";
import { simulatorDbRoutes } from "@/features/simulator-db/routes";
import { socketTesterRoutes } from "@/features/socket-tester/routes";
import { socksRelayRoutes } from "@/features/socks-relay/routes";
import { tempFileRoutes } from "@/features/temp-files/routes";
import { wheelRoutes } from "@/features/wheel/routes";

const QrisTapReaderPage = lazy(() =>
  import("@/pages/dashboard/qris-tap-reader").then(({ QrisTapReaderPage }) => ({
    default: QrisTapReaderPage,
  }))
);

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
    <Route element={<QrisTapReaderPage />} path="qris-tap-reader" />
    {gameRoutes}
    {overviewRoutes}
    {endpointRoutes}
    {serverInventoryRoutes}
    {logViewerRoutes}
    {wheelRoutes}
    {simulatorDbRoutes}
    {employeeRoutes}
    {socketTesterRoutes}
    {tempFileRoutes}
    {developerToolRoutes}
    {socksRelayRoutes}
    <Route
      element={<Navigate replace to="/dashboard/overview" />}
      path="users"
    />
  </Route>
);
