import { lazy } from "react";
import { Navigate, Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { developerToolRoutes } from "@/features/developer-tools/routes";
import { endpointRoutes } from "@/features/endpoints/routes";
import { overviewRoutes } from "@/features/overview/routes";
import { socketTesterRoutes } from "@/features/socket-tester/routes";
import { socksRelayRoutes } from "@/features/socks-relay/routes";

const FallLinePage = lazy(() =>
  import("@/pages/dashboard/fall-line").then(({ FallLinePage }) => ({
    default: FallLinePage,
  }))
);

const TerrabrowserPage = lazy(() =>
  import("@/pages/dashboard/terrabrowser").then(({ TerrabrowserPage }) => ({
    default: TerrabrowserPage,
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
    <Route
      element={<Navigate replace to="/dashboard/games/fall-line" />}
      path="games"
    />
    <Route element={<FallLinePage />} path="games/fall-line" />
    <Route element={<TerrabrowserPage />} path="games/terrabrowser" />
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
