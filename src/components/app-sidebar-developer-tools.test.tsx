import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";

describe("AppSidebar developer tools navigation", () => {
  test("links the catalog before the individual tools", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard/developer-tools"]}>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const catalogLink = await screen.findByRole("link", {
      name: "Tool catalog",
    });
    const validatorLink = screen.getByRole("link", {
      name: "JSON Schema Validator",
    });
    const links = screen.getAllByRole("link");

    expect(catalogLink.getAttribute("href")).toBe("/dashboard/developer-tools");
    expect(links.indexOf(catalogLink)).toBeLessThan(
      links.indexOf(validatorLink)
    );
  });
});
