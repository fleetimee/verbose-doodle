import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { queryClient } from "@/lib/query-client";
import { About } from "@/pages/about";
import { BillingPage } from "@/pages/dashboard/billing";
import { OverviewPage } from "@/pages/dashboard/overview";
import { ScenariosPage } from "@/pages/dashboard/scenarios";
import { SettingsPage } from "@/pages/dashboard/settings";
import { Home } from "@/pages/home";
import { Login } from "@/pages/login";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route element={<Home />} path="/" />
            <Route element={<Login />} path="/login" />
            <Route element={<About />} path="/about" />

            {/* Dashboard with nested routes */}
            <Route element={<DashboardLayout />} path="/dashboard">
              <Route
                element={<Navigate replace to="/dashboard/overview" />}
                index
              />
              <Route element={<OverviewPage />} path="overview" />
              <Route element={<BillingPage />} path="billing" />
              <Route element={<ScenariosPage />} path="scenarios" />
              <Route element={<SettingsPage />} path="settings" />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
