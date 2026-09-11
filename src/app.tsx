import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MotionConfig } from "motion/react";
import { BrowserRouter } from "react-router";
import { AppRoutes } from "@/app-routes";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { TokenExpirationDialog } from "@/components/token-expiration-dialog";
import { Toaster } from "@/components/ui/sonner";
import { ScreenLockProvider } from "@/features/auth/components/screen-lock";
import { AuthProvider } from "@/features/auth/context";
import { DashboardVisitNotifications } from "@/features/dashboard/components/dashboard-visit-notifications";
import { queryClient } from "@/lib/query-client";

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <MotionConfig reducedMotion="never">
                <ScreenLockProvider>
                  <AppRoutes />
                  <TokenExpirationDialog />
                  <Toaster position="bottom-center" />
                  <DashboardVisitNotifications />
                </ScreenLockProvider>
              </MotionConfig>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
