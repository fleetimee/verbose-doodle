import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { TourProvider } from "@/components/tour";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";
import { NumberBaseConverterPage } from "@/pages/dashboard/number-base-converter";

describe("Number Base Converter navigation", () => {
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

    const link = await screen.findByRole("link", {
      name: "Number Base Converter",
    });
    expect(link.getAttribute("href")).toBe(
      "/dashboard/developer-tools/number-base-converter"
    );
  });

  test("renders the converter page at its dashboard path", () => {
    localStorage.setItem("number-base-converter-tour-seen", "true");
    render(
      <MemoryRouter
        initialEntries={["/dashboard/developer-tools/number-base-converter"]}
      >
        <Routes>
          <Route
            element={
              <TourProvider>
                <NumberBaseConverterPage />
              </TourProvider>
            }
            path="/dashboard/developer-tools/number-base-converter"
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Number Base Converter",
      })
    ).toBeDefined();
  });
});
