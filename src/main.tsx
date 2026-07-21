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
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AuthRedirect } from "@/components/auth-redirect";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotFoundPage } from "@/components/not-found";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { TokenExpirationDialog } from "@/components/token-expiration-dialog";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/context";

import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { ForbiddenPage } from "@/features/socks-relay/components/forbidden-page";
import { SocksRelayProvider } from "@/features/socks-relay/context/socks-relay-context";
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
const JsonSchemaValidatorPage = lazy(() =>
  import("@/pages/dashboard/json-schema-validator").then(
    ({ JsonSchemaValidatorPage }) => ({ default: JsonSchemaValidatorPage })
  )
);
const JwtInspectorPage = lazy(() =>
  import("@/pages/dashboard/jwt-inspector").then(({ JwtInspectorPage }) => ({
    default: JwtInspectorPage,
  }))
);
const DeveloperToolsPage = lazy(() =>
  import("@/pages/dashboard/developer-tools").then(
    ({ DeveloperToolsPage }) => ({ default: DeveloperToolsPage })
  )
);
const JsonYamlConverterPage = lazy(() =>
  import("@/pages/dashboard/json-yaml-converter").then(
    ({ JsonYamlConverterPage }) => ({ default: JsonYamlConverterPage })
  )
);
const CronParserPage = lazy(() =>
  import("@/pages/dashboard/cron-parser").then(({ CronParserPage }) => ({
    default: CronParserPage,
  }))
);
const DateConverterPage = lazy(() =>
  import("@/pages/dashboard/date-converter").then(({ DateConverterPage }) => ({
    default: DateConverterPage,
  }))
);
const NumberBaseConverterPage = lazy(() =>
  import("@/pages/dashboard/number-base-converter").then(
    ({ NumberBaseConverterPage }) => ({ default: NumberBaseConverterPage })
  )
);
const SocksRelayRestApiPage = lazy(() =>
  import("@/pages/dashboard/socks-relay-rest-api").then(
    ({ SocksRelayRestApiPage }) => ({
      default: SocksRelayRestApiPage,
    })
  )
);
const SocksRelayIso8583Page = lazy(() =>
  import("@/pages/dashboard/socks-relay-iso-8583").then(
    ({ SocksRelayIso8583Page }) => ({
      default: SocksRelayIso8583Page,
    })
  )
);
if (import.meta.env.DEV) {
  await import("react-grab");
}

function SocksRelayRouteGroup() {
  return (
    <ProtectedRoute fallback={<ForbiddenPage />} requiredRole="ADMIN">
      <SocksRelayProvider>
        <Outlet />
      </SocksRelayProvider>
    </ProtectedRoute>
  );
}

function AppContent() {
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
            <Route element={<DeveloperToolsPage />} path="developer-tools" />
            <Route
              element={<JsonSchemaValidatorPage />}
              path="developer-tools/json-schema-validator"
            />
            <Route
              element={<JwtInspectorPage />}
              path="developer-tools/jwt-inspector"
            />
            <Route
              element={<JsonYamlConverterPage />}
              path="developer-tools/json-yaml-converter"
            />
            <Route
              element={<CronParserPage />}
              path="developer-tools/cron-parser"
            />
            <Route
              element={<NumberBaseConverterPage />}
              path="developer-tools/number-base-converter"
            />
            <Route
              element={<DateConverterPage />}
              path="developer-tools/date-converter"
            />
            <Route element={<SocksRelayRouteGroup />} path="socks-relay">
              <Route
                element={
                  <Navigate replace to="/dashboard/socks-relay/rest-api" />
                }
                index
              />
              <Route element={<SocksRelayRestApiPage />} path="rest-api" />
              <Route element={<SocksRelayIso8583Page />} path="iso-8583" />
            </Route>
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
