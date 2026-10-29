import { lazy } from "react";
import { Navigate, Route } from "react-router";

const TempFilesPage = lazy(() =>
  import("@/pages/dashboard/temp-files").then(({ TempFilesPage }) => ({
    default: TempFilesPage,
  }))
);

export const tempFileRoutes = (
  <>
    <Route element={<TempFilesPage />} path="temp-files" />
    <Route
      element={<Navigate replace to="/dashboard/temp-files" />}
      path="developer-tools/temp-files"
    />
  </>
);
