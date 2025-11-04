import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/fira-code/400.css";
import "@fontsource/fira-code/500.css";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnimatePresence } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotFoundPage } from "@/components/not-found";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { TokenExpirationDialog } from "@/components/token-expiration-dialog";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/context";
import { useAutoRefresh } from "@/features/auth/hooks/use-auto-refresh";
import { useTokenExpirationCheck } from "@/features/auth/hooks/use-token-expiration-check";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { queryClient } from "@/lib/query-client";
import { About } from "@/pages/about";
import { EndpointDetailPage } from "@/pages/dashboard/endpoint-detail";
import { EndpointsPage } from "@/pages/dashboard/endpoints";
import { OverviewPage } from "@/pages/dashboard/overview";
import { UsersPage } from "@/pages/dashboard/users";
import { Login } from "@/pages/login";

function AppContent() {
  const location = useLocation();

  // Check for expired token on mount/navigation
  useTokenExpirationCheck();
  // Automatically refresh token before expiration
  useAutoRefresh();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
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
          <Route
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UsersPage />
              </ProtectedRoute>
            }
            path="users"
          />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </AnimatePresence>
      <TokenExpirationDialog />
      <Toaster position="bottom-center" />
    </>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
