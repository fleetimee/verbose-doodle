import { Suspense } from "react";
import { Route, Routes } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { useI18n } from "@/components/i18n-provider";
import { NotFoundPage } from "@/components/not-found";
import { aboutRoutes } from "@/features/about/routes";
import { authRoutes } from "@/features/auth/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";

export function AppRoutes() {
  const { locale } = useI18n();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes key={locale}>
        <Route element={<AuthRedirect />} path="/" />
        {authRoutes}
        {aboutRoutes}
        {dashboardRoutes}
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  );
}
