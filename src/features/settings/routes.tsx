import { lazy } from "react";
import { Route } from "react-router";

const SettingsPage = lazy(() =>
  import("@/pages/dashboard/settings").then(({ SettingsPage }) => ({
    default: SettingsPage,
  }))
);

export const settingsRoutes = (
  <Route element={<SettingsPage />} path="settings" />
);
