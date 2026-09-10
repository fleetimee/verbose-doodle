import { lazy } from "react";
import { Route } from "react-router";

const OverviewPage = lazy(() =>
  import("@/pages/dashboard/overview").then(({ OverviewPage }) => ({
    default: OverviewPage,
  }))
);

export const overviewRoutes = (
  <Route element={<OverviewPage />} path="overview" />
);
