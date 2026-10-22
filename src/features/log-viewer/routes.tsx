import { lazy } from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

const LogViewerPage = lazy(() =>
  import("@/pages/dashboard/log-viewer").then(({ LogViewerPage }) => ({
    default: LogViewerPage,
  }))
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
