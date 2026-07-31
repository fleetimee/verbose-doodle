import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { TourProvider } from "@/components/tour";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";
import { CronParserPage } from "@/pages/dashboard/cron-parser";

describe("Cron Parser navigation", () => {
  test("shows the tool in signed-in navigation", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const link = await screen.findByRole("link", { name: "Cron Parser" });
    expect(link.getAttribute("href")).toBe(
      "/dashboard/developer-tools/cron-parser"
    );
  });

  test("renders the parser page at its dashboard path", () => {
    localStorage.setItem("cron-parser-tour-seen", "true");
    render(
      <MemoryRouter initialEntries={["/dashboard/developer-tools/cron-parser"]}>
        <Routes>
          <Route
            element={
              <TourProvider>
                <CronParserPage />
              </TourProvider>
            }
            path="/dashboard/developer-tools/cron-parser"
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Cron Parser" })
    ).toBeDefined();
  });
});
