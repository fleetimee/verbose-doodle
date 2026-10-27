import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { useI18n } from "@/components/i18n-provider";
import { NotFoundPage } from "@/components/not-found";
import { ProtectedRoute } from "@/components/protected-route";
import { aboutRoutes } from "@/features/about/routes";
import { authRoutes } from "@/features/auth/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";

const WheelResultPage = lazy(() =>
  import("@/pages/wheel-result").then(({ WheelResultPage }) => ({
    default: WheelResultPage,
  }))
);

const ServerTerminalPage = lazy(() =>
  import("@/pages/server-terminal").then(({ ServerTerminalPage }) => ({
    default: ServerTerminalPage,
  }))
);

const ServerDesktopPage = lazy(() =>
  import("@/pages/server-desktop").then(({ ServerDesktopPage }) => ({
    default: ServerDesktopPage,
  }))
);

const ServerContainerTerminalPage = lazy(() =>
  import("@/pages/server-container-terminal").then(
    ({ ServerContainerTerminalPage }) => ({
      default: ServerContainerTerminalPage,
    })
  )
);

export function AppRoutes() {
  const { locale } = useI18n();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes key={locale}>
        <Route element={<AuthRedirect />} path="/" />
        <Route element={<WheelResultPage />} path="/wheel/results/:token" />
        {authRoutes}
        {aboutRoutes}
        {dashboardRoutes}
        <Route
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ServerTerminalPage />
            </ProtectedRoute>
          }
          path="/servers/:serverId/terminal"
        />
        <Route
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ServerTerminalPage filesOnly />
            </ProtectedRoute>
          }
          path="/servers/:serverId/files"
        />
        <Route
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ServerDesktopPage />
            </ProtectedRoute>
          }
          path="/servers/:serverId/desktop"
        />
        <Route
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <ServerContainerTerminalPage />
            </ProtectedRoute>
          }
          path="/servers/:serverId/containers/:containerId/terminal"
        />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  );
}
