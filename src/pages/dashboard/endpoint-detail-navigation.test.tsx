import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { TourProvider } from "@/components/tour";
import { AuthProvider } from "@/features/auth/context";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "@/features/dashboard/dashboard-navigation-context";
import { EndpointDetailPage } from "@/pages/dashboard/endpoint-detail";

const EDIT_ENDPOINT_BUTTON_NAME = /edit endpoint/i;
const METRICS_BUTTON_NAME = /metrics/i;

const endpointOne = {
  biller_name: "PLN",
  biller_slug: "pln",
  endpoint_id: "endpoint-1",
  method: "GET",
  responses: [
    {
      activated: true,
      json: "{}",
      name: "Inquiry response",
      response_id: "response-1",
      status_code: 200,
    },
  ],
  slug: "pln-get-inquiry-a1b2c3",
  url: "/inquiry",
};

const endpointTwo = {
  biller_name: "PDAM",
  biller_slug: "pdam",
  endpoint_id: "endpoint-2",
  method: "POST",
  responses: [],
  slug: "pdam-post-payment-d4e5f6",
  url: "/payment",
};

const originalFetch = globalThis.fetch;
let requestEndpointNavigation: ((path: string) => void) | null = null;

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
  const mockFetch = (input: Parameters<typeof globalThis.fetch>[0]) => {
    const url = String(input);

    if (url === "/api/biller") {
      return Promise.resolve(
        jsonResponse({
          data: {
            billers: [
              { biller_name: "PLN", slug: "pln" },
              { biller_name: "PDAM", slug: "pdam" },
            ],
          },
        })
      );
    }

    if (url === "/api/endpoint") {
      return Promise.resolve(
        jsonResponse({ data: { endpoints: [endpointOne, endpointTwo] } })
      );
    }

    if (url === "/api/endpoint/pln-get-inquiry-a1b2c3") {
      return Promise.resolve(jsonResponse({ data: { endpoint: endpointOne } }));
    }

    if (url === "/api/endpoint/pdam-post-payment-d4e5f6") {
      return Promise.resolve(jsonResponse({ data: { endpoint: endpointTwo } }));
    }

    if (url.includes("/traffic-logs")) {
      return Promise.resolve(
        jsonResponse({ data: { hasMore: false, items: [], nextCursor: null } })
      );
    }

    if (url.includes("/metrics")) {
      return Promise.resolve(jsonResponse({ data: {} }));
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
  const navigation = useDashboardNavigation();
  requestEndpointNavigation = navigation.requestEndpointNavigation;
  const endpointPath = "/dashboard/endpoints/pdam-post-payment-d4e5f6";

  return (
    <>
      <button
        onClick={() => navigation.requestEndpointNavigation(endpointPath)}
        type="button"
      >
        Switch endpoint
      </button>
      <button
        onClick={() => navigation.requestEndpointNavigation(endpointPath)}
        type="button"
      >
        Switch biller
      </button>
    </>
  );
}

function renderEndpointDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter
      initialEntries={["/dashboard/endpoints/pln-get-inquiry-a1b2c3"]}
    >
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
                        <LocationProbe />
                        <NavigationProbe />
                      </>
                    }
                    path="/dashboard/endpoints/:slug"
                  />
                </Routes>
              </DashboardNavigationProvider>
            </TourProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

async function switchEndpoint(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("button", { name: "Switch endpoint" })
  );
}

async function switchBiller(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("button", { name: "Switch biller" })
  );
}

async function openResponseEditor(user: ReturnType<typeof userEvent.setup>) {
  const editButtons = await screen.findAllByRole("button", {
    name: "More response actions for Inquiry response",
  });
  await user.click(editButtons[0]);
  await user.click(await screen.findByRole("menuitem", { name: "Edit Name" }));
}

function requestEndpointSwitch(
  path = "/dashboard/endpoints/pdam-post-payment-d4e5f6"
) {
  act(() => {
    requestEndpointNavigation?.(path);
  });
}

describe("EndpointDetailPage navigation protection", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    localStorage.setItem("endpoint-detail-tour-seen", "true");
    window.history.replaceState({ idx: 0 }, "", "/");
    requestEndpointNavigation = null;
    installApiMock();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    window.history.replaceState({}, "", "/");
    requestEndpointNavigation = null;
  });

  test.each([
    ["endpoint", switchEndpoint],
    ["biller", switchBiller],
  ])(
    "guards a dirty URL edit before an %s switch and keeps editing when cancelled",
    async (_scope, switchWorkspace) => {
      const user = userEvent.setup();
      renderEndpointDetail();

      await user.click(
        await screen.findByRole("button", { name: EDIT_ENDPOINT_BUTTON_NAME })
      );
      const urlInput = await screen.findByDisplayValue("/inquiry");
      await user.clear(urlInput);
      await user.type(urlInput, "/changed");

      await switchWorkspace(user);

      expect(await screen.findByRole("alertdialog")).toBeDefined();
      await user.click(screen.getByRole("button", { name: "Keep editing" }));

      expect(screen.getByDisplayValue("/changed")).toBeDefined();
      expect(screen.getByTestId("location").textContent).toContain(
        "pln-get-inquiry-a1b2c3"
      );
    }
  );

  test("protects a dirty Add Response form during browser back navigation", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await user.click(
      await screen.findByRole("button", { name: "Add Response" })
    );
    await user.type(
      await screen.findByPlaceholderText("success_response"),
      "changed_response"
    );
    requestEndpointSwitch();

    expect(await screen.findByRole("alertdialog")).toBeDefined();
    expect(screen.getByTestId("location").textContent).toContain(
      "pln-get-inquiry-a1b2c3"
    );

    await user.click(
      screen.getByRole("button", { name: "Discard and switch" })
    );
    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toContain(
        "pdam-post-payment-d4e5f6"
      );
    });
  });

  test("protects a dirty response-edit form during browser back navigation", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await openResponseEditor(user);
    const responseNameInput =
      await screen.findByDisplayValue("Inquiry response");
    await user.clear(responseNameInput);
    await user.type(responseNameInput, "Changed response");
    requestEndpointSwitch();

    expect(await screen.findByRole("alertdialog")).toBeDefined();
    await user.click(
      screen.getByRole("button", { name: "Discard and switch" })
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toContain(
        "pdam-post-payment-d4e5f6"
      );
    });
  });

  test("switches cleanly and closes the metrics overlay", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();

    await user.click(
      await screen.findByRole("button", { name: METRICS_BUTTON_NAME })
    );
    expect(await screen.findByRole("dialog")).toBeDefined();
    requestEndpointSwitch();

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByTestId("location").textContent).toContain(
        "pdam-post-payment-d4e5f6"
      );
    });
  });

  test.each(["Add Response", "response editor"] as const)(
    "closes a clean %s overlay before an allowed browser-history switch",
    async (overlay) => {
      const user = userEvent.setup();
      renderEndpointDetail();

      if (overlay === "Add Response") {
        await user.click(
          await screen.findByRole("button", { name: "Add Response" })
        );
        expect(
          await screen.findByPlaceholderText("success_response")
        ).toBeDefined();
      } else {
        await openResponseEditor(user);
        expect(
          await screen.findByDisplayValue("Inquiry response")
        ).toBeDefined();
      }

      requestEndpointSwitch();

      await waitFor(() => {
        expect(screen.getByTestId("location").textContent).toContain(
          "pdam-post-payment-d4e5f6"
        );
      });
      expect(screen.queryByPlaceholderText("success_response")).toBeNull();
      expect(screen.queryByDisplayValue("Inquiry response")).toBeNull();
    }
  );

  test("guards native browser history while a response edit is dirty", async () => {
    const user = userEvent.setup();
    renderEndpointDetail();
    await openResponseEditor(user);
    const responseNameInput =
      await screen.findByDisplayValue("Inquiry response");
    await user.clear(responseNameInput);
    await user.type(responseNameInput, "Changed response");

    window.history.pushState({ idx: 1 }, "", "/next");
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: window.history.state })
    );

    expect(await screen.findByRole("alertdialog")).toBeDefined();
    expect(screen.getByTestId("location").textContent).toContain(
      "pln-get-inquiry-a1b2c3"
    );
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
