import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
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
import { toast } from "sonner";
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
  billerName: "PLN",
  billerSlug: "pln",
  id: endpointOneId,
  method: "GET",
  responses: [responseOne, responseTwo],
  slug: endpointOneSlug,
  url: "/inquiry",
};

const endpointTwo: Endpoint = {
  billerName: "PDAM",
  billerSlug: "pdam",
  id: endpointTwoId,
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
  slug: endpointTwoSlug,
  url: "/payment",
};

const originalFetch = globalThis.fetch;
let currentEndpointOne = structuredClone(endpointOne);
let endpointOneNotFound = false;
let deferEndpointOneDetail = false;
let cloneResponseFailure = false;
let deferCloneResponse = false;
let activateResponseFailure = false;
let deactivateResponseFailure = false;
let resolveEndpointOneDetail: (() => void) | null = null;
let resolveCloneResponse: (() => void) | null = null;
let mutationMethods: string[] = [];
let mutationBodies: unknown[] = [];

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
      mutationBodies.push(init?.body);
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

    if (url === `/api/response/${responseOne.id}/clone` && method === "POST") {
      if (cloneResponseFailure) {
        return Promise.resolve(
          jsonResponse({ responseDesc: "Unable to clone response" }, 500)
        );
      }

      const clonedResponse = {
        ...responseOne,
        activated: false,
        id: "response-4",
        name: "Primary response (Copy)",
      };
      const completeClone = () => {
        currentEndpointOne = {
          ...currentEndpointOne,
          responses: [...currentEndpointOne.responses, clonedResponse],
        };
        return jsonResponse({ data: { response: clonedResponse } });
      };

      if (deferCloneResponse) {
        return new Promise<Response>((resolve) => {
          resolveCloneResponse = () => resolve(completeClone());
        });
      }

      return Promise.resolve(completeClone());
    }

    if (
      url === `/api/response/${endpointOneId}/${responseTwo.id}/activate` &&
      method === "PUT"
    ) {
      if (activateResponseFailure) {
        return Promise.resolve(
          jsonResponse({ responseDesc: "Unable to activate response" }, 500)
        );
      }

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
      if (deactivateResponseFailure) {
        return Promise.resolve(
          jsonResponse({ responseDesc: "Unable to deactivate response" }, 500)
        );
      }

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
    cloneResponseFailure = false;
    deferCloneResponse = false;
    activateResponseFailure = false;
    deactivateResponseFailure = false;
    resolveEndpointOneDetail = null;
    resolveCloneResponse = null;
    mutationMethods = [];
    mutationBodies = [];
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

  test("clones a response, sends no body, refreshes, and selects the clone", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await user.click(
      await findResponseButton("More response actions for Primary response")
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Clone response" })
    );
    expect(screen.getByRole("alertdialog")).toBeDefined();
    expect(mutationMethods).toHaveLength(0);
    await user.click(
      await screen.findByRole("button", { name: "Clone response" })
    );

    await waitFor(() => {
      expect(mutationMethods).toContain(
        `POST /api/response/${responseOne.id}/clone`
      );
      expect(mutationBodies.at(-1)).toBeUndefined();
      expectResponseSelection("Primary response (Copy)", true);
    });
    expectResponseSelection("Primary response", false);
  });

  test("cancels the clone confirmation without sending a request", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await user.click(
      await findResponseButton("More response actions for Primary response")
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Clone response" })
    );
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(mutationMethods).toHaveLength(0);
  });

  test("shows clone loading state and prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    deferCloneResponse = true;
    renderEndpointDetail();

    await user.click(
      await findResponseButton("More response actions for Primary response")
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Clone response" })
    );
    await user.click(
      await screen.findByRole("button", { name: "Clone response" })
    );

    await waitFor(() => {
      expect(
        screen
          .getAllByRole("status")
          .some((status) => status.textContent === "Cloning response...")
      ).toBe(true);
      expect(
        screen
          .getAllByRole("button", {
            name: "More response actions for Primary response",
          })
          .some((button) => button.hasAttribute("disabled"))
      ).toBe(true);
    });
    expect(
      mutationMethods.filter((method) => method.startsWith("POST "))
    ).toHaveLength(1);

    act(() => {
      resolveCloneResponse?.();
    });
    await waitFor(() =>
      expectResponseSelection("Primary response (Copy)", true)
    );
  });

  test("keeps the response selection usable and shows clone failures", async () => {
    const user = userEvent.setup();
    const errorToast = spyOn(toast, "error");
    errorToast.mockClear();
    cloneResponseFailure = true;

    try {
      renderEndpointDetail();

      await user.click(
        await findResponseButton("More response actions for Primary response")
      );
      await user.click(
        await screen.findByRole("menuitem", { name: "Clone response" })
      );
      await user.click(
        await screen.findByRole("button", { name: "Clone response" })
      );

      await waitFor(() => {
        expect(errorToast).toHaveBeenCalledWith("Failed to clone response", {
          description: "Unable to clone response",
        });
        expectResponseSelection("Primary response", true);
      });
      expect(screen.queryByText("Primary response (Copy)")).toBeNull();
    } finally {
      errorToast.mockRestore();
    }
  });

  test("shows one error toast when activation fails", async () => {
    const user = userEvent.setup();
    const errorToast = spyOn(toast, "error");
    errorToast.mockClear();
    activateResponseFailure = true;

    try {
      renderEndpointDetail();

      await user.click(await findResponseButton("Activate Backup response"));
      await user.click(await screen.findByRole("button", { name: "Activate" }));

      await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));
    } finally {
      errorToast.mockRestore();
    }
  });

  test("shows one error toast when deactivation fails", async () => {
    const user = userEvent.setup();
    const errorToast = spyOn(toast, "error");
    errorToast.mockClear();
    deactivateResponseFailure = true;

    try {
      renderEndpointDetail();

      await user.click(
        await findResponseButton("More response actions for Primary response")
      );
      await user.click(
        await screen.findByRole("menuitem", { name: "Deactivate response" })
      );
      await user.click(
        await screen.findByRole("button", { name: "Deactivate" })
      );

      await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));
    } finally {
      errorToast.mockRestore();
    }
  });

  test.each([
    ["another active response", true],
    ["no remaining active response", false],
  ])(
    "updates the preview selection after deactivation with %s",
    async (_caseName, hasRemainingActiveResponse) => {
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
      await user.click(
        await screen.findByRole("button", { name: "Deactivate" })
      );

      await waitFor(() => {
        expectResponseSelection("Backup response", hasRemainingActiveResponse);
        expectResponseSelection("Primary response", false);
      });
    }
  );

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
