import { lazy } from "react";
import { Route } from "react-router";

const ServerInventoryPage = lazy(() =>
  import("@/pages/dashboard/server-inventory").then(
    ({ ServerInventoryPage }) => ({ default: ServerInventoryPage })
  )
);

export const serverInventoryRoutes = (
  <Route element={<ServerInventoryPage />} path="servers" />
);
