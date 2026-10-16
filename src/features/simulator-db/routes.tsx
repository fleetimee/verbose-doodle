import { lazy } from "react";
import { Route } from "react-router";

const SimulatorDbPage = lazy(() =>
  import("@/pages/dashboard/simulator-db").then(({ SimulatorDbPage }) => ({
    default: SimulatorDbPage,
  }))
);

export const simulatorDbRoutes = (
  <Route element={<SimulatorDbPage />} path="simulator-db" />
);
