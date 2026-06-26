import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/mona-sans/latin-400.css";
import "@fontsource/mona-sans/latin-500.css";
import "@fontsource/mona-sans/latin-600.css";
import "@fontsource/mona-sans/latin-700.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-500.css";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
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

const About = lazy(() =>
  import("@/pages/about").then(({ About }) => ({ default: About }))
);
const Login = lazy(() =>
  import("@/pages/login").then(({ Login }) => ({ default: Login }))
);
const LoggedOut = lazy(() =>
  import("@/pages/logged-out").then(({ LoggedOut }) => ({
    default: LoggedOut,
  }))
);
const OverviewPage = lazy(() =>
  import("@/pages/dashboard/overview").then(({ OverviewPage }) => ({
    default: OverviewPage,
  }))
);
const EndpointsPage = lazy(() =>
  import("@/pages/dashboard/endpoints").then(({ EndpointsPage }) => ({
    default: EndpointsPage,
  }))
);
const EndpointDetailPage = lazy(() =>
  import("@/pages/dashboard/endpoint-detail").then(
    ({ EndpointDetailPage }) => ({
      default: EndpointDetailPage,
    })
  )
);
const SocketTesterPage = lazy(() =>
  import("@/pages/dashboard/socket-tester").then(({ SocketTesterPage }) => ({
    default: SocketTesterPage,
  }))
);
const TcpClientPage = lazy(() =>
  import("@/pages/dashboard/tcp-client").then(({ TcpClientPage }) => ({
    default: TcpClientPage,
  }))
);
const TcpServerPage = lazy(() =>
  import("@/pages/dashboard/tcp-server").then(({ TcpServerPage }) => ({
    default: TcpServerPage,
  }))
);
const UdpPage = lazy(() =>
  import("@/pages/dashboard/udp").then(({ UdpPage }) => ({
    default: UdpPage,
  }))
);
if (import.meta.env.DEV) {
  await import("react-grab");
}

function AppContent() {
  // Check for expired token on mount/navigation
  useTokenExpirationCheck();
  // Automatically refresh token before expiration
  useAutoRefresh();

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AuthRedirect />} path="/" />
          <Route element={<Login />} path="/login" />
          <Route element={<LoggedOut />} path="/logged-out" />
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
            <Route element={<SocketTesterPage />} path="socket-tester" />
            <Route element={<TcpClientPage />} path="socket-test/tcp-client" />
            <Route element={<TcpServerPage />} path="socket-test/tcp-server" />
            <Route element={<UdpPage />} path="socket-test/udp" />
            <Route
              element={<Navigate replace to="/dashboard/overview" />}
              path="users"
            />
          </Route>

          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
      <TokenExpirationDialog />
      <Toaster position="bottom-center" />
    </>
  );
}

function RouteFallback() {
  return <div className="min-h-screen bg-background" />;
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
