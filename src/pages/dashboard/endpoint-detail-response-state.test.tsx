import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { TourProvider } from "@/components/tour";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/context";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "@/features/dashboard/dashboard-navigation-context";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import type { Endpoint } from "@/features/endpoints/types";
import { EndpointDetailPage } from "@/pages/dashboard/endpoint-detail";

const endpointOneId = "endpoint-1";
const endpointTwoId = "endpoint-2";
const endpointOneSlug = "pln-get-inquiry-a1b2c3";
const endpointTwoSlug = "pdam-post-payment-d4e5f6";
const endpointOnePath = `/dashboard/endpoints/${endpointOneSlug}`;
const endpointTwoPath = `/dashboard/endpoints/${endpointTwoSlug}`;

const responseOne = {
  activated: true,
  delayMs: 0,
  id: "response-1",
  json: '{"response":"one"}',
  name: "Primary response",
  simulateTimeout: false,
  statusCode: 200,
};

const responseTwo = {
  activated: false,
  delayMs: 0,
  id: "response-2",
  json: '{"response":"two"}',
  name: "Backup response",
  simulateTimeout: false,
  statusCode: 200,
};

const endpointOne: Endpoint = {
  billerSlug: "pln",
  billerName: "PLN",
  id: endpointOneId,
  slug: endpointOneSlug,
  method: "GET",
  responses: [responseOne, responseTwo],
  url: "/inquiry",
};

const endpointTwo: Endpoint = {
  billerSlug: "pdam",
  billerName: "PDAM",
  id: endpointTwoId,
  slug: endpointTwoSlug,
  method: "POST",
  responses: [
    {
      activated: true,
      delayMs: 0,
      id: "response-3",
      json: '{"response":"payment"}',
      name: "Payment response",
      simulateTimeout: false,
      statusCode: 201,
    },
  ],
  url: "/payment",
};

const originalFetch = globalThis.fetch;
let currentEndpointOne = structuredClone(endpointOne);
let endpointOneNotFound = false;
let deferEndpointOneDetail = false;
let resolveEndpointOneDetail: (() => void) | null = null;
let mutationMethods: string[] = [];

function createAdminToken() {
  const payload = btoa(
    JSON.stringify({ role: "ADMIN", user_id: "user-1", username: "admin" })
  );
  return `header.${payload}.signature`;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

function endpointResponse(endpoint: Endpoint) {
  return jsonResponse({ data: { endpoint } });
}

function installApiMock() {
  const mockFetch = (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: Parameters<typeof globalThis.fetch>[1]
  ) => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (method !== "GET") {
      mutationMethods.push(`${method} ${url}`);
    }

    if (url === "/api/endpoint" && method === "GET") {
      return Promise.resolve(
        jsonResponse({
          data: { endpoints: [currentEndpointOne, endpointTwo] },
        })
      );
    }

    if (url === `/api/endpoint/${endpointOneSlug}` && method === "GET") {
      if (endpointOneNotFound) {
        return Promise.resolve(jsonResponse({ data: {} }, 404));
      }

      if (deferEndpointOneDetail) {
        return new Promise<Response>((resolve) => {
          resolveEndpointOneDetail = () =>
            resolve(endpointResponse(currentEndpointOne));
        });
      }

      return Promise.resolve(endpointResponse(currentEndpointOne));
    }

    if (url === `/api/endpoint/${endpointTwoSlug}` && method === "GET") {
      return Promise.resolve(endpointResponse(endpointTwo));
    }

    if (
      url === `/api/response/${endpointOneId}/${responseTwo.id}/activate` &&
      method === "PUT"
    ) {
      currentEndpointOne = {
        ...currentEndpointOne,
        responses: currentEndpointOne.responses.map((response) => ({
          ...response,
          activated: response.id === responseTwo.id,
        })),
      };
      return Promise.resolve(
        jsonResponse({
          data: {
            response: currentEndpointOne.responses.find(
              (response) => response.id === responseTwo.id
            ),
          },
        })
      );
    }

    if (
      url === `/api/response/${endpointOneId}/${responseOne.id}/deactivate` &&
      method === "PUT"
    ) {
      currentEndpointOne = {
        ...currentEndpointOne,
        responses: currentEndpointOne.responses.map((response) => ({
          ...response,
          activated: response.id === responseTwo.id,
        })),
      };
      return Promise.resolve(
        jsonResponse({
          data: {
            response: currentEndpointOne.responses.find(
              (response) => response.id === responseOne.id
            ),
          },
        })
      );
    }

    if (url.includes("/traffic-logs") || url.includes("/metrics")) {
      return Promise.resolve(
        jsonResponse({ data: { hasMore: false, items: [], nextCursor: null } })
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

  return <output data-testid="location">{location.pathname}</output>;
}

function NavigationProbe() {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate(endpointTwoPath)} type="button">
        Switch endpoint
      </button>
      <LocationProbe />
    </>
  );
}

function RefreshProbe() {
  const queryClient = useQueryClient();

  return (
    <button
      onClick={() => {
        act(() => {
          queryClient.invalidateQueries({
            queryKey: endpointDataQueryKeys.workspace(endpointOneSlug),
          });
        });
      }}
      type="button"
    >
      Refresh endpoint
    </button>
  );
}

function RememberedEndpointProbe() {
  const { getRememberedEndpoint } = useDashboardNavigation();
  const [rememberedEndpoint, setRememberedEndpoint] = useState(
    getRememberedEndpoint("pln") ?? ""
  );

  return (
    <>
      <output data-testid="remembered-endpoint">{rememberedEndpoint}</output>
      <button
        onClick={() =>
          setRememberedEndpoint(getRememberedEndpoint("pln") ?? "")
        }
        type="button"
      >
        Read remembered endpoint
      </button>
    </>
  );
}

function renderEndpointDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const view = render(
    <MemoryRouter initialEntries={[endpointOnePath]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light">
            <TourProvider>
              <DashboardNavigationProvider>
                <Routes>
                  <Route
                    element={
                      <>
                        <EndpointDetailPage />
                        <NavigationProbe />
                        <RefreshProbe />
                        <RememberedEndpointProbe />
                      </>
                    }
                    path="/dashboard/endpoints/:slug"
                  />
                  <Route
                    element={
                      <>
                        <LocationProbe />
                        <RememberedEndpointProbe />
                      </>
                    }
                    path="/dashboard/endpoints"
                  />
                </Routes>
                <Toaster />
              </DashboardNavigationProvider>
            </TourProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return { queryClient, view };
}

async function findResponseButton(name: string) {
  const buttons = await screen.findAllByRole("button", { name });
  return buttons[0];
}

function expectResponseSelection(name: string, isSelected: boolean) {
  const buttons = screen.getAllByRole("button", {
    name: `More response actions for ${name}`,
  });
  expect(
    buttons.some((button) => button.hasAttribute("disabled") === !isSelected)
  ).toBe(true);
}

describe("EndpointDetailPage response state", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    localStorage.setItem("endpoint-detail-tour-seen", "true");
    currentEndpointOne = structuredClone(endpointOne);
    endpointOneNotFound = false;
    deferEndpointOneDetail = false;
    resolveEndpointOneDetail = null;
    mutationMethods = [];
    installApiMock();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("opens response actions from the context menu", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    const responseName = (await screen.findAllByText("Primary response"))[0];
    fireEvent.contextMenu(responseName);
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit Name" })
    );

    expect(await screen.findByDisplayValue("Primary response")).toBeDefined();
  });

  test("selects an activated response after activation succeeds", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await findResponseButton("More response actions for Primary response");
    await user.click(await findResponseButton("Activate Backup response"));
    await user.click(await screen.findByRole("button", { name: "Activate" }));

    await waitFor(() => {
      expectResponseSelection("Backup response", true);
    });
    expectResponseSelection("Primary response", false);
  });

  test.each([
    ["another active response", true],
    ["no remaining active response", false],
  ])("updates the preview selection after deactivation with %s", async (_caseName, hasRemainingActiveResponse) => {
    const user = userEvent.setup();
    currentEndpointOne = {
      ...currentEndpointOne,
      responses: currentEndpointOne.responses.map((response) => ({
        ...response,
        activated: response.id === responseOne.id,
      })),
    };
    if (hasRemainingActiveResponse) {
      currentEndpointOne.responses = currentEndpointOne.responses.map(
        (response) => ({ ...response, activated: true })
      );
    }
    renderEndpointDetail();

    await user.click(
      await findResponseButton("More response actions for Primary response")
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Deactivate response" })
    );
    await user.click(await screen.findByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expectResponseSelection("Backup response", hasRemainingActiveResponse);
      expectResponseSelection("Primary response", false);
    });
  });

  test("warns on multiple active responses without repairing server data", async () => {
    currentEndpointOne = {
      ...currentEndpointOne,
      responses: currentEndpointOne.responses.map((response) => ({
        ...response,
        activated: true,
      })),
    };
    renderEndpointDetail();

    expect(
      await screen.findByText("Multiple active responses detected")
    ).toBeDefined();
    expect(
      screen.getAllByRole("button", {
        name: "More response actions for Primary response",
      })
    ).toHaveLength(2);
    expectResponseSelection("Primary response", true);
    expectResponseSelection("Backup response", false);
    expect(mutationMethods).toEqual([]);
  });

  test("removes a confirmed-deleted endpoint from cache and returns to the list", async () => {
    const user = userEvent.setup();
    const { queryClient } = renderEndpointDetail();

    await screen.findAllByText("Primary response");
    endpointOneNotFound = true;
    await user.click(screen.getByRole("button", { name: "Refresh endpoint" }));

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/dashboard/endpoints"
      );
    });
    expect(screen.getByText("Endpoint no longer exists")).toBeDefined();
    expect(
      queryClient
        .getQueryData<Endpoint[]>(endpointDataQueryKeys.catalog)
        ?.some((endpoint) => endpoint.id === endpointOneId)
    ).toBe(false);

    await user.click(
      screen.getByRole("button", { name: "Read remembered endpoint" })
    );
    expect(screen.getByTestId("remembered-endpoint").textContent).toBe("");
  });

  test("ignores a late response for the previous endpoint after switching", async () => {
    const user = userEvent.setup();
    deferEndpointOneDetail = true;
    renderEndpointDetail();

    await screen.findAllByText("Primary response");
    await user.click(screen.getByRole("button", { name: "Switch endpoint" }));

    await waitFor(() => {
      expect(screen.getAllByText("Payment response")).not.toHaveLength(0);
      expect(screen.getByTestId("location").textContent).toBe(endpointTwoPath);
    });

    currentEndpointOne = {
      ...currentEndpointOne,
      method: "DELETE",
      url: "/late-response",
    };
    act(() => {
      resolveEndpointOneDetail?.();
    });

    await waitFor(() => {
      expect(screen.getAllByText("Payment response")).not.toHaveLength(0);
      expect(screen.queryByText("/late-response")).toBeNull();
    });
  });
});
