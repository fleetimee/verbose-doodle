import { lazy } from "react";
import { Route } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";

const SimulatorDbPage = lazy(() =>
  import("@/pages/dashboard/simulator-db").then(({ SimulatorDbPage }) => ({
    default: SimulatorDbPage,
  }))
);

export const simulatorDbRoutes = (
  <Route element={<SimulatorDbPage />} path="simulator-db" />
);

const SimulatorDbStandalonePage = lazy(() =>
  import("@/pages/simulator-db-standalone").then(
    ({ SimulatorDbStandalonePage }) => ({
      default: SimulatorDbStandalonePage,
    })
  )
);

export const simulatorDbStandaloneRoutes = (
  <Route
    element={
      <ProtectedRoute>
        <SimulatorDbStandalonePage />
      </ProtectedRoute>
    }
    path="/simulator-db"
  />
);
