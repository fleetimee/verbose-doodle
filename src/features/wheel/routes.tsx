import { lazy } from "react";
import { Route } from "react-router";

const WheelPage = lazy(() =>
  import("@/pages/dashboard/wheel").then((module) => ({
    default: module.WheelPage,
  }))
);
export const wheelRoutes = <Route element={<WheelPage />} path="wheel" />;
