import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { TourProvider } from "@/components/tour";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";
import { DateConverterPage } from "@/pages/dashboard/date-converter";

describe("Date Converter navigation", () => {
  test("shows the tool in signed-in navigation", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/dashboard/developer-tools/date-converter"]}
        >
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const link = await screen.findByRole("link", { name: "Date Converter" });
    expect(link.getAttribute("href")).toBe(
      "/dashboard/developer-tools/date-converter"
    );
  });

  test("renders the converter page at its dashboard path", () => {
    localStorage.setItem("date-converter-tour-seen", "true");
    localStorage.setItem("date-converter-timezone", '"UTC"');
    render(
      <MemoryRouter
        initialEntries={["/dashboard/developer-tools/date-converter"]}
      >
        <Routes>
          <Route
            element={
              <TourProvider>
                <DateConverterPage />
              </TourProvider>
            }
            path="/dashboard/developer-tools/date-converter"
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Date Converter" })
    ).toBeDefined();
  });
});
