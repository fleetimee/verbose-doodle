import { lazy } from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

const LogViewerPage = lazy(() =>
  import("@/pages/dashboard/log-viewer").then(({ LogViewerPage }) => ({
    default: LogViewerPage,
  }))
);

const LogSourcePage = lazy(() =>
  import("@/pages/log-source").then(({ LogSourcePage }) => ({
    default: LogSourcePage,
  }))
);

export const logSourceRoutes = (
  <Route
    element={
      <ProtectedRoute requiredRole="ADMIN">
        <LogSourcePage />
      </ProtectedRoute>
    }
    path="/logs/:sourceId"
  />
);

export const logViewerRoutes = (
  <Route
    element={
      <ProtectedRoute requiredRole="ADMIN">
        <LogViewerPage />
      </ProtectedRoute>
    }
    path="logs"
  />
);
