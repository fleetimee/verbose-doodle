import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/context";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { queryClient } from "@/lib/query-client";
import { About } from "@/pages/about";
import { EndpointDetailPage } from "@/pages/dashboard/endpoint-detail";
import { EndpointsPage } from "@/pages/dashboard/endpoints";
import { OverviewPage } from "@/pages/dashboard/overview";
import { SettingsPage } from "@/pages/dashboard/settings";
import { UsersPage } from "@/pages/dashboard/users";
import { Login } from "@/pages/login";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
            <Routes>
              <Route element={<AuthRedirect />} path="/" />
              <Route element={<Login />} path="/login" />
              <Route element={<About />} path="/about" />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
                path="/dashboard"
              >
                <Route
                  element={<Navigate replace to="/dashboard/overview" />}
                  index
                />
                <Route element={<OverviewPage />} path="overview" />
                <Route element={<EndpointsPage />} path="endpoints" />
                <Route element={<EndpointDetailPage />} path="endpoints/:id" />
                <Route element={<UsersPage />} path="users" />
                <Route element={<SettingsPage />} path="settings" />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
