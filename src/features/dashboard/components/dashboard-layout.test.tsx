import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { encodeId } from "@/lib/id-encoder";

const originalFetch = globalThis.fetch;
const encodedEndpointId = encodeId("endpoint-1");
let availableBillers = [
  { biller_name: "PLN", id: 1 },
  { biller_name: "PDAM", id: 2 },
];

function createAdminToken() {
  const payload = btoa(
    JSON.stringify({ role: "ADMIN", user_id: "user-1", username: "admin" })
  );
  return `header.${payload}.signature`;
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function installApiMock() {
  const endpoint = {
    biller_id: 1,
    biller_name: "PLN",
    endpoint_id: "endpoint-1",
    method: "POST",
    responses: [],
    url: "/xapi-pbb/api/user/login",
  };
  const alternateEndpoint = {
    biller_id: 1,
    biller_name: "PLN",
    endpoint_id: "endpoint-2",
    method: "GET",
    responses: [],
    url: "/xapi-pbb/api/user/status",
  };
  const mockFetch = (input: Parameters<typeof globalThis.fetch>[0]) => {
    const url = String(input);

    if (url === "/api/biller") {
      return Promise.resolve(
        jsonResponse({
          data: {
            billers: availableBillers,
          },
        })
      );
    }

    if (url === "/api/endpoint") {
      return Promise.resolve(
        jsonResponse({
          data: { endpoints: [endpoint, alternateEndpoint] },
        })
      );
    }

    if (
      url === "/api/endpoint/endpoint-1" ||
      url === "/api/endpoint/endpoint-2"
    ) {
      return Promise.resolve(
        jsonResponse({
          data: {
            endpoint: url.endsWith("endpoint-1") ? endpoint : alternateEndpoint,
          },
        })
      );
    }

    return Promise.resolve(jsonResponse({ data: {} }));
  };

  globalThis.fetch = Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect,
  });
}

function LocationProbe() {
  const location = useLocation();

  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter
      initialEntries={[`/dashboard/endpoints/${encodedEndpointId}`]}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<DashboardLayout />} path="/dashboard">
              <Route element={<LocationProbe />} path="endpoints" />
              <Route element={<LocationProbe />} path="endpoints/:id" />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("DashboardLayout endpoint breadcrumbs", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    localStorage.setItem("socket-tester-bridge-auto-connect", "false");
    availableBillers = [
      { biller_name: "PLN", id: 1 },
      { biller_name: "PDAM", id: 2 },
    ];
    installApiMock();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("shows the endpoint breadcrumb with the current biller selected", async () => {
    renderDashboard();

    const breadcrumb = await screen.findByRole("navigation", {
      name: "breadcrumb",
    });

    expect(breadcrumb.textContent).toContain("Endpoints");
    expect(breadcrumb.textContent).toContain("PLN");
    expect(breadcrumb.textContent).toContain("POST");
    expect(breadcrumb.textContent).toContain("/xapi-pbb/api/user/login");
    expect(
      (await screen.findByRole("combobox", { name: "Biller" })).textContent
    ).toContain("PLN");
  });

  test("navigates to the selected biller endpoint list", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(await screen.findByRole("option", { name: "PDAM" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints?billerId=2"
      );
    });
  });

  test("navigates directly to another endpoint for the current biller", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Endpoint" }));
    await user.click(
      await screen.findByRole("option", {
        name: "GET /xapi-pbb/api/user/status",
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        `/dashboard/endpoints/${encodeId("endpoint-2")}`
      );
    });
  });

  test("falls back to plain biller text when the current biller is unavailable", async () => {
    availableBillers = [{ biller_name: "PDAM", id: 2 }];
    renderDashboard();

    expect(await screen.findByText("PLN")).toBeDefined();
    expect(screen.queryByRole("combobox", { name: "Biller" })).toBeNull();
  });
});
