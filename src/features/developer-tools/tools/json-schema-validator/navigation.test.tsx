import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";

describe("JSON Schema Validator navigation", () => {
  test("shows the developer tool in the signed-in navigation", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/dashboard/developer-tools/json-schema-validator"]}
        >
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const link = await screen.findByRole("link", {
      name: "JSON Schema Validator",
    });
    expect(link.getAttribute("href")).toBe(
      "/dashboard/developer-tools/json-schema-validator"
    );
  });
});
