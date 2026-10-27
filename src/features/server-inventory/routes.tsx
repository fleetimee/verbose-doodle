import { lazy } from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

const ServerInventoryPage = lazy(() =>
  import("@/pages/dashboard/server-inventory").then(
    ({ ServerInventoryPage }) => ({ default: ServerInventoryPage })
  )
);

const ServerMetricsPage = lazy(() =>
  import("@/pages/dashboard/server-metrics").then(({ ServerMetricsPage }) => ({
    default: ServerMetricsPage,
  }))
);

const ServerHostDetailPage = lazy(() =>
  import("@/pages/dashboard/server-host-detail").then(
    ({ ServerHostDetailPage }) => ({ default: ServerHostDetailPage })
  )
);

export const serverInventoryRoutes = (
  <>
    <Route element={<ServerInventoryPage />} path="servers" />
    <Route
      element={
        <ProtectedRoute requiredRole="ADMIN">
          <ServerMetricsPage />
        </ProtectedRoute>
      }
      path="server-metrics"
    />
    <Route
      element={
        <ProtectedRoute requiredRole="ADMIN">
          <ServerHostDetailPage />
        </ProtectedRoute>
      }
      path="server-metrics/:serverId"
    />
    <Route
      element={
        <ProtectedRoute requiredRole="ADMIN">
          <ServerHostDetailPage />
        </ProtectedRoute>
      }
      path="server-metrics/:serverId/containers/:containerId"
    />
  </>
);
