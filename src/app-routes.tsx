import { Suspense } from "react";
import { Route, Routes } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { NotFoundPage } from "@/components/not-found";
import { aboutRoutes } from "@/features/about/routes";
import { authRoutes } from "@/features/auth/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route element={<AuthRedirect />} path="/" />
        {authRoutes}
        {aboutRoutes}
        {dashboardRoutes}
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  );
}
