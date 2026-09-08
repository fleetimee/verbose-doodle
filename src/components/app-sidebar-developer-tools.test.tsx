import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/features/auth/context";
import { formatOptionShortcut } from "@/lib/keyboard-shortcuts";

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

describe("AppSidebar developer tools navigation", () => {
  test("uses the Option symbol for shortcuts on macOS", () => {
    expect(formatOptionShortcut("O", "MacIntel")).toBe("⌥O");
  });

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
    expect(
      screen.queryByRole("link", { name: "JSON Schema Validator" })
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Validation" }));

    const validatorLink = await screen.findByRole("link", {
      name: "JSON Schema Validator",
    });
    const links = screen.getAllByRole("link");

    expect(catalogLink.getAttribute("href")).toBe("/dashboard/developer-tools");
    expect(links.indexOf(catalogLink)).toBeLessThan(
      links.indexOf(validatorLink)
    );
  });

  test("searches nested modules from the command palette", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(
      await screen.findByRole("dialog", { name: "Search modules and menus" })
    ).toBeTruthy();

    fireEvent.change(
      screen.getByPlaceholderText("Search modules and menus..."),
      {
        target: { value: "validation" },
      }
    );

    expect(await screen.findByText("JSON Schema Validator")).toBeTruthy();
  });

  test("selects the current page and resets search after navigation", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/dashboard/socket-test/tcp-client"]}>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
              <LocationProbe />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    await waitFor(() => {
      expect(
        screen.getByRole("option", { selected: true }).textContent
      ).toContain("TCP Client");
    });

    expect(screen.getByRole("status").textContent).toBe(
      "Connect to a TCP server and exchange messages."
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "validation" },
    });
    await waitFor(() => {
      expect(
        screen.getByRole("option", { selected: true }).textContent
      ).toContain("JSON Schema Validator");
    });
    expect(screen.getByRole("status").textContent).toBe(
      "Validate JSON against a schema."
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/developer-tools/json-schema-validator"
      );
    });

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    await waitFor(() => {
      expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
      expect(
        screen.getByRole("option", { selected: true }).textContent
      ).toContain("JSON Schema Validator");
    });

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    await waitFor(() => {
      expect(
        screen.getByRole("option", { selected: true }).textContent
      ).not.toContain("JSON Schema Validator");
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "overview" },
    });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    await waitFor(() => {
      expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
      expect(
        screen.getByRole("option", { selected: true }).textContent
      ).toContain("JSON Schema Validator");
    });
  });

  test("reveals and runs Alt navigation shortcuts", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/dashboard/endpoints"]}>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
              <LocationProbe />
            </SidebarProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.keyDown(document, { altKey: true, key: "Alt" });
    expect(await screen.findByText("Alt+O")).toBeTruthy();

    fireEvent.keyDown(document, {
      altKey: true,
      code: "KeyO",
      key: "ø",
    });
    expect(screen.getByTestId("location").textContent).toBe(
      "/dashboard/overview"
    );

    fireEvent.keyDown(document, {
      altKey: true,
      code: "KeyS",
      key: "ß",
    });
    expect(screen.getByTestId("location").textContent).toBe(
      "/dashboard/overview"
    );
    expect(
      await screen.findByRole("link", { name: "TCP Client" })
    ).toBeTruthy();
    expect(await screen.findByText("Alt+P")).toBeTruthy();

    fireEvent.keyDown(document, {
      altKey: true,
      code: "KeyP",
      key: "π",
    });
    expect(screen.getByTestId("location").textContent).toBe(
      "/dashboard/socket-test/tcp-client"
    );

    fireEvent.keyDown(document, {
      altKey: true,
      code: "KeyV",
      key: "√",
    });
    expect(await screen.findByText("Alt+J")).toBeTruthy();

    fireEvent.keyDown(document, {
      altKey: true,
      code: "KeyJ",
      key: "∆",
    });
    expect(screen.getByTestId("location").textContent).toBe(
      "/dashboard/developer-tools/json-schema-validator"
    );

    fireEvent.keyUp(document, { key: "Alt" });
    expect(screen.queryByText("Alt+O")).toBeNull();
  });
});
