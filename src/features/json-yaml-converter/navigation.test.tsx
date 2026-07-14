import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";
import { JsonYamlConverterPage } from "@/pages/dashboard/json-yaml-converter";

describe("JSON/YAML Converter navigation", () => {
  test("shows the developer tool in signed-in navigation", async () => {
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
      name: "JSON/YAML Converter",
    });
    expect(link.getAttribute("href")).toBe(
      "/dashboard/developer-tools/json-yaml-converter"
    );
  });

  test("renders the converter page at its dashboard path", () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard/developer-tools/json-yaml-converter"]}
      >
        <Routes>
          <Route
            element={<JsonYamlConverterPage />}
            path="/dashboard/developer-tools/json-yaml-converter"
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "JSON/YAML Converter" })
    ).toBeDefined();
  });
});
