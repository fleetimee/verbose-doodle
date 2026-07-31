import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout";
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";

const originalFetch = globalThis.fetch;
const endpointId = "pln-post-login-a1b2c3";
let availableBillers = [
  { biller_name: "PLN", slug: "pln" },
  { biller_name: "PDAM", slug: "pdam" },
  { biller_name: "Empty Biller", slug: "empty-biller" },
];
let endpointBillerName: string | undefined = "PLN";
let resolveEndpointMutation: (() => void) | null = null;

type MockEndpoint = {
  biller_slug: string;
  biller_name: string | undefined;
  endpoint_id: string;
  slug: string;
  method: string;
  responses: { activated?: boolean; response_id: string }[];
  url: string;
};

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
  const endpoint: MockEndpoint = {
    biller_slug: "pln",
    biller_name: endpointBillerName,
    endpoint_id: "endpoint-1",
    slug: "pln-post-login-a1b2c3",
    method: "POST",
    responses: [{ response_id: "response-1" }],
    url: "/xapi-pbb/api/user/login",
  };
  const alternateEndpoint: MockEndpoint = {
    biller_slug: "pln",
    biller_name: "PLN",
    endpoint_id: "endpoint-2",
    slug: "pln-get-status-d4e5f6",
    method: "GET",
    responses: [{ response_id: "response-2" }],
    url: "/xapi-pbb/api/user/status",
  };
  const emptyEndpoint: MockEndpoint = {
    biller_slug: "empty-biller",
    biller_name: "Empty Biller",
    endpoint_id: "endpoint-3",
    slug: "empty-biller-get-status-a1b2c3",
    method: "GET",
    responses: [],
    url: "/xapi-pbb/api/empty/status",
  };
  const pdamEndpoint: MockEndpoint = {
    biller_slug: "pdam",
    biller_name: "PDAM",
    endpoint_id: "endpoint-pdam",
    slug: "pdam-get-payment-status-a1b2c3",
    method: "GET",
    responses: [{ activated: true, response_id: "response-pdam" }],
    url: "/xapi-pbb/api/payment/status",
  };
  const mockFetch = (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: RequestInit
  ) => {
    const url = String(input);

    if (url === "/api/endpoint" && init?.method === "POST") {
      const request = JSON.parse(String(init.body)) as {
        biller_slug: string;
        method: string;
        url: string;
      };

      return Promise.resolve(
        jsonResponse({
          data: {
            endpoint: {
              biller_slug: request.biller_slug,
              biller_name: "PLN",
              endpoint_id: "created-endpoint",
              slug: "pln-get-created-a1b2c3",
              method: request.method,
              responses: [],
              url: request.url,
            },
          },
        })
      );
    }

    if (url === "/api/biller" && init?.method === "POST") {
      return Promise.resolve(
        jsonResponse({
          data: {
            biller: { biller_name: "New Biller", slug: "new-biller" },
          },
        })
      );
    }

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
          data: {
            endpoints: [
              endpoint,
              alternateEndpoint,
              pdamEndpoint,
              emptyEndpoint,
            ],
          },
        })
      );
    }

    if (
      url === "/api/endpoint/pln-post-login-a1b2c3" ||
      url === "/api/endpoint/pln-get-status-d4e5f6" ||
      url === "/api/endpoint/pdam-get-payment-status-a1b2c3"
    ) {
      let detailEndpoint = pdamEndpoint;

      if (url.endsWith("pln-post-login-a1b2c3")) {
        detailEndpoint = endpoint;
      } else if (url.endsWith("pln-get-status-d4e5f6")) {
        detailEndpoint = alternateEndpoint;
      }

      return Promise.resolve(
        jsonResponse({
          data: {
            endpoint: detailEndpoint,
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

function HistoryControls() {
  const navigate = useNavigate();

  return (
    <>
      <LocationProbe />
      <button onClick={() => navigate(-1)} type="button">
        Back
      </button>
      <button onClick={() => navigate(1)} type="button">
        Forward
      </button>
    </>
  );
}

function EndpointMutationProbe() {
  const mutation = useMutation<void, Error>({
    mutationKey: ENDPOINT_MUTATION_KEY,
    mutationFn: () =>
      new Promise<void>((resolve) => {
        resolveEndpointMutation = resolve;
      }),
  });

  return (
    <button onClick={() => mutation.mutate()} type="button">
      Start endpoint mutation
    </button>
  );
}

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={[`/dashboard/endpoints/${endpointId}`]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<DashboardLayout />} path="/dashboard">
              <Route element={<LocationProbe />} path="endpoints" />
              <Route element={<LocationProbe />} path="endpoints/:slug" />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function renderHistoryDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={[`/dashboard/endpoints/${endpointId}`]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<DashboardLayout />} path="/dashboard">
              <Route element={<HistoryControls />} path="endpoints" />
              <Route element={<HistoryControls />} path="endpoints/:slug" />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function renderMutationDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={[`/dashboard/endpoints/${endpointId}`]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<DashboardLayout />} path="/dashboard">
              <Route
                element={
                  <>
                    <LocationProbe />
                    <EndpointMutationProbe />
                  </>
                }
                path="endpoints/:slug"
              />
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
      { biller_name: "PLN", slug: "pln" },
      { biller_name: "PDAM", slug: "pdam" },
      { biller_name: "Empty Biller", slug: "empty-biller" },
    ];
    endpointBillerName = "PLN";
    resolveEndpointMutation = null;
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

  test("stays on endpoint details and selects the first endpoint for a new biller", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(await screen.findByRole("option", { name: "PDAM" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints/pdam-get-payment-status-a1b2c3"
      );
    });
  });

  test("lists billers with endpoints even when no response is active", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));

    expect(await screen.findByRole("option", { name: "PLN" })).toBeDefined();
    expect(await screen.findByRole("option", { name: "PDAM" })).toBeDefined();
    expect(
      await screen.findByRole("option", { name: "Empty Biller" })
    ).toBeDefined();
  });

  test("opens add biller from the top of the biller selector", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(
      await screen.findByRole("option", { name: "Add New Biller" })
    );

    expect(
      await screen.findByText(
        "Create a biller that can own simulated endpoints."
      )
    ).toBeDefined();
    expect(screen.getByTestId("location").textContent).toBe(
      `/dashboard/endpoints/${endpointId}`
    );
  });

  test("creates a biller from the breadcrumb without leaving the detail page", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(
      await screen.findByRole("option", { name: "Add New Biller" })
    );
    await screen.findByText(
      "Create a biller that can own simulated endpoints."
    );

    await user.type(screen.getByLabelText("Biller Name"), "New Biller");
    await user.click(screen.getByRole("button", { name: "Create Biller" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Create a biller that can own simulated endpoints.")
      ).toBeNull();
    });
    expect(screen.getByTestId("location").textContent).toBe(
      `/dashboard/endpoints/${endpointId}`
    );
  });

  test("filters billers from the breadcrumb selector", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.type(
      await screen.findByPlaceholderText("Search billers..."),
      "PD"
    );

    expect(await screen.findByRole("option", { name: "PDAM" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "PLN" })).toBeNull();
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
        "/dashboard/endpoints/pln-get-status-d4e5f6"
      );
    });
  });

  test("opens add endpoint from the top of the endpoint selector", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Endpoint" }));
    await user.click(
      await screen.findByRole("option", { name: "Add New Endpoint" })
    );

    expect(
      await screen.findByText(
        "Create a new API endpoint for a specific biller."
      )
    ).toBeDefined();
    const billerSelectors = screen.getAllByRole("combobox", { name: "Biller" });
    expect(billerSelectors.at(-1)?.textContent).toContain("PLN");
    expect(screen.getByTestId("location").textContent).toBe(
      `/dashboard/endpoints/${endpointId}`
    );
  });

  test("closes the add endpoint sheet after creation without leaving the detail page", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Endpoint" }));
    await user.click(
      await screen.findByRole("option", { name: "Add New Endpoint" })
    );
    await screen.findByText("Create a new API endpoint for a specific biller.");

    await user.clear(screen.getByLabelText("URL"));
    await user.type(screen.getByLabelText("URL"), "/from-breadcrumb");
    await user.click(screen.getByRole("button", { name: "Create Endpoint" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Create a new API endpoint for a specific biller.")
      ).toBeNull();
    });
    expect(screen.getByTestId("location").textContent).toBe(
      `/dashboard/endpoints/${endpointId}`
    );
  });

  test("filters endpoints from the breadcrumb selector", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Endpoint" }));
    await user.type(
      await screen.findByPlaceholderText("Search endpoints..."),
      "status"
    );

    expect(
      await screen.findByRole("option", {
        name: "GET /xapi-pbb/api/user/status",
      })
    ).toBeDefined();
    expect(
      screen.queryByRole("option", {
        name: "POST /xapi-pbb/api/user/login",
      })
    ).toBeNull();
  });

  test("remembers the last endpoint for each biller during the session", async () => {
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
        "/dashboard/endpoints/pln-get-status-d4e5f6"
      );
    });

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(await screen.findByRole("option", { name: "PDAM" }));
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints/pdam-get-payment-status-a1b2c3"
      );
    });

    await user.click(await screen.findByRole("combobox", { name: "Biller" }));
    await user.click(await screen.findByRole("option", { name: "PLN" }));
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints/pln-get-status-d4e5f6"
      );
    });
  });

  test("applies the same endpoint transition when moving through browser history", async () => {
    const user = userEvent.setup();
    renderHistoryDashboard();

    await user.click(await screen.findByRole("combobox", { name: "Endpoint" }));
    await user.click(
      await screen.findByRole("option", {
        name: "GET /xapi-pbb/api/user/status",
      })
    );
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints/pln-get-status-d4e5f6"
      );
    });

    await user.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        `/dashboard/endpoints/${endpointId}`
      );
    });

    await user.click(screen.getByRole("button", { name: "Forward" }));
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints/pln-get-status-d4e5f6"
      );
    });
  });

  test("disables both workspace selectors while an endpoint mutation is pending", async () => {
    const user = userEvent.setup();
    renderMutationDashboard();

    const billerSelector = await screen.findByRole("combobox", {
      name: "Biller",
    });
    const endpointSelector = await screen.findByRole("combobox", {
      name: "Endpoint",
    });

    await user.click(
      screen.getByRole("button", { name: "Start endpoint mutation" })
    );

    await waitFor(() => {
      expect((billerSelector as HTMLButtonElement).disabled).toBe(true);
      expect((endpointSelector as HTMLButtonElement).disabled).toBe(true);
    });

    act(() => {
      resolveEndpointMutation?.();
    });

    await waitFor(() => {
      expect((billerSelector as HTMLButtonElement).disabled).toBe(false);
      expect((endpointSelector as HTMLButtonElement).disabled).toBe(false);
    });
  });

  test("falls back to plain biller text when the current biller is unavailable", async () => {
    availableBillers = [{ biller_name: "PDAM", slug: "pdam" }];
    renderDashboard();

    expect(await screen.findByText("PLN")).toBeDefined();
    expect(screen.queryByRole("combobox", { name: "Biller" })).toBeNull();
  });

  test("falls back to the biller slug when its name is unavailable", async () => {
    availableBillers = [];
    endpointBillerName = undefined;
    installApiMock();
    renderDashboard();

    expect(await screen.findByText("Biller pln")).toBeDefined();
    expect(screen.queryByRole("combobox", { name: "Biller" })).toBeNull();
  });
});
