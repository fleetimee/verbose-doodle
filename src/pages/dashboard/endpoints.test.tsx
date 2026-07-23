import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { TourProvider } from "@/components/tour";
import { AuthProvider } from "@/features/auth/context";
import { EndpointsPage } from "@/pages/dashboard/endpoints";

const billers = [
  { id: 1, name: "PLN" },
  { id: 2, name: "PDAM" },
];

const endpoints = [
  {
    billerId: 1,
    billerName: "PLN",
    id: "endpoint-1",
    method: "GET" as const,
    responses: [],
    url: "/inquiry",
  },
];

const originalFetch = globalThis.fetch;
let lastCreateBody: { billerId?: number } | null = null;

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
  const mockFetch = (
    input: Parameters<typeof globalThis.fetch>[0],
    init: Parameters<typeof globalThis.fetch>[1]
  ) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url === "/api/endpoint" && method === "GET") {
      return Promise.resolve(jsonResponse({ data: { endpoints } }));
    }

    if (url === "/api/biller" && method === "GET") {
      return Promise.resolve(
        jsonResponse({
          data: {
            billers: billers.map(({ id, name }) => ({
              biller_name: name,
              id,
            })),
          },
        })
      );
    }

    if (url === "/api/endpoint" && method === "POST") {
      const body = JSON.parse(String(init?.body)) as { billerId?: number };
      lastCreateBody = body;
      return Promise.resolve(
        jsonResponse({
          data: {
            endpoint: {
              biller_id: body.billerId,
              biller_name: billers.find((biller) => biller.id === body.billerId)
                ?.name,
              id: "created-endpoint",
              method: "GET",
              url: "/rest",
            },
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

function renderEndpointsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TourProvider>
            <EndpointsPage />
          </TourProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("EndpointsPage endpoint creation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    localStorage.setItem("endpoints-tour-seen", "true");
    lastCreateBody = null;
    installApiMock();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("opens a contextual form with its biller selected and allows changing it", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Add endpoint for PLN" })
    );

    const billerSelect = screen.getByLabelText("Biller");
    expect(await within(billerSelect).findByText("PLN")).toBeDefined();

    await user.click(billerSelect);
    await user.click(await screen.findByRole("option", { name: "PDAM" }));
    expect(within(billerSelect).getByText("PDAM")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Create Endpoint" }));
    expect(lastCreateBody).toMatchObject({ billerId: 2 });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("opens the global form without automatically selecting a biller", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Add Endpoint" })
    );

    const billerSelect = screen.getByLabelText("Biller");
    expect(within(billerSelect).getByText("Select a biller")).toBeDefined();
  });

  test("rejects the global form until a biller is selected", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Add Endpoint" })
    );
    await user.click(screen.getByRole("button", { name: "Create Endpoint" }));

    expect(lastCreateBody).toBeNull();
    expect(screen.getByText("Biller ID must be a number")).toBeDefined();
  });

  test("resets unsaved values and reapplies the clicked biller on reopen", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Add endpoint for PLN" })
    );
    const billerSelect = screen.getByLabelText("Biller");
    await within(billerSelect).findByText("PLN");
    await user.click(billerSelect);
    await user.click(await screen.findByRole("option", { name: "PDAM" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(
      await screen.findByRole("button", { name: "Add endpoint for PLN" })
    );
    expect(
      within(screen.getByLabelText("Biller")).getByText("PLN")
    ).toBeDefined();
  });

  test("hides both creation entry points without permission", () => {
    localStorage.removeItem("auth_token");
    renderEndpointsPage();

    expect(screen.queryByRole("button", { name: "Add Endpoint" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Add endpoint for PLN" })
    ).toBeNull();
  });
});
