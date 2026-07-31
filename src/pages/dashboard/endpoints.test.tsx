import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { TourProvider } from "@/components/tour";
import { AuthProvider } from "@/features/auth/context";
import { EndpointsPage } from "@/pages/dashboard/endpoints";

const billers = [
  { slug: "pln", name: "PLN" },
  { slug: "pdam", name: "PDAM" },
];

const endpoints = [
  {
    billerSlug: "pln",
    billerName: "PLN",
    id: "endpoint-1",
    slug: "pln-get-inquiry-a1b2c3",
    method: "GET" as const,
    responses: [
      {
        activated: true,
        delayMs: 0,
        id: "response-1",
        json: "{}",
        name: "Inquiry response",
        statusCode: 200,
      },
    ],
    url: "/inquiry",
  },
];

const pdamEndpoint = {
  billerSlug: "pdam",
  billerName: "PDAM",
  id: "endpoint-2",
  slug: "pdam-post-payment-d4e5f6",
  method: "POST" as const,
  responses: [],
  url: "/payment",
};

const originalFetch = globalThis.fetch;
let lastCreateBody: { biller_slug?: string } | null = null;
let lastBillerUpdateBody: Record<string, unknown> | null = null;
let lastBillerUpdateSlug: string | null = null;
let lastUpdateBody: Record<string, unknown> | null = null;
let lastDeleteId: string | null = null;
let currentEndpoint: (typeof endpoints)[number] | null = { ...endpoints[0] };
let extraCatalogEndpoint: typeof pdamEndpoint | null = null;
let deleteRequestResolver: (() => void) | null = null;
let holdDeleteRequest = false;
let shouldFailDelete = false;
let shouldFailUpdate = false;
let shouldFailBillerUpdate = false;
let billerNames = new Map([
  ["pln", "PLN"],
  ["pdam", "PDAM"],
]);
const endpointButtonName = /GET.*inquiry/i;
const pdamEndpointButtonName = /POST.*payment/i;
const configuredResponseName = /1 configured response/;

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
  ): Promise<Response> => {
    const url = String(input);
    const method = init?.method ?? "GET";

    if (url === "/api/endpoint" && method === "GET") {
      return Promise.resolve(
        jsonResponse({
          data: {
            endpoints: [currentEndpoint, extraCatalogEndpoint].filter(
              (endpoint): endpoint is NonNullable<typeof endpoint> =>
                endpoint !== null
            ),
          },
        })
      );
    }

    if (url === "/api/biller" && method === "GET") {
      return Promise.resolve(
        jsonResponse({
          data: {
            billers: billers.map(({ slug }) => ({
              biller_name: billerNames.get(slug),
              slug,
            })),
          },
        })
      );
    }

    if (url.startsWith("/api/biller/") && method === "PATCH") {
      lastBillerUpdateSlug = url.replace("/api/biller/", "");
      lastBillerUpdateBody = JSON.parse(String(init?.body)) as Record<
        string,
        unknown
      >;

      if (shouldFailBillerUpdate) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ responseDesc: "Biller name already exists" }),
            {
              headers: { "Content-Type": "application/json" },
              status: 400,
            }
          )
        );
      }

      const nextName = String(lastBillerUpdateBody.billerName);
      billerNames.set(lastBillerUpdateSlug, nextName);
      if (lastBillerUpdateSlug === "pln" && currentEndpoint) {
        currentEndpoint = { ...currentEndpoint, billerName: nextName };
      }
      return Promise.resolve(
        jsonResponse({
          data: {
            biller: { biller_name: nextName, slug: lastBillerUpdateSlug },
          },
        })
      );
    }

    if (url === "/api/endpoint" && method === "POST") {
      const body = JSON.parse(String(init?.body)) as { biller_slug?: string };
      lastCreateBody = body;
      return Promise.resolve(
        jsonResponse({
          data: {
            endpoint: {
              biller_slug: body.biller_slug,
              biller_name: billers.find(
                (biller) => biller.slug === body.biller_slug
              )?.name,
              id: "created-endpoint",
              slug: "pln-get-rest-a1b2c3",
              method: "GET",
              url: "/rest",
            },
          },
        })
      );
    }

    if (url === "/api/endpoint/pln-get-inquiry-a1b2c3" && method === "PATCH") {
      if (shouldFailUpdate) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
          })
        );
      }
      const body = JSON.parse(String(init?.body)) as Partial<
        (typeof endpoints)[number]
      >;
      lastUpdateBody = body;
      if (!currentEndpoint) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            headers: { "Content-Type": "application/json" },
            status: 404,
          })
        );
      }
      currentEndpoint = { ...currentEndpoint, ...body };
      return Promise.resolve(
        jsonResponse({ data: { endpoint: currentEndpoint } })
      );
    }

    if (url === "/api/endpoint/pln-get-inquiry-a1b2c3" && method === "DELETE") {
      lastDeleteId = "endpoint-1";

      if (holdDeleteRequest) {
        return new Promise((resolve) => {
          deleteRequestResolver = () => {
            if (shouldFailDelete) {
              resolve(
                new Response(JSON.stringify({ data: {} }), {
                  headers: { "Content-Type": "application/json" },
                  status: 500,
                })
              );
              return;
            }

            currentEndpoint = null;
            resolve(jsonResponse({ data: {} }));
          };
        });
      }

      if (shouldFailDelete) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
          })
        );
      }

      currentEndpoint = null;
      return Promise.resolve(jsonResponse({ data: {} }));
    }

    return Promise.resolve(jsonResponse({ data: {} }));
  };

  globalThis.fetch = Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect,
  });
}

function renderEndpointsPage(initialEntries = ["/dashboard/endpoints"]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter initialEntries={initialEntries}>
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

describe("EndpointsPage catalog actions", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    localStorage.setItem("endpoints-tour-seen", "true");
    lastCreateBody = null;
    lastBillerUpdateBody = null;
    lastBillerUpdateSlug = null;
    lastUpdateBody = null;
    lastDeleteId = null;
    currentEndpoint = { ...endpoints[0] };
    extraCatalogEndpoint = null;
    deleteRequestResolver = null;
    holdDeleteRequest = false;
    shouldFailDelete = false;
    shouldFailUpdate = false;
    shouldFailBillerUpdate = false;
    billerNames = new Map([
      ["pln", "PLN"],
      ["pdam", "PDAM"],
    ]);
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
    expect(lastCreateBody).toMatchObject({ biller_slug: "pdam" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("renames a biller by slug and refreshes the catalog label", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Edit biller PLN" })
    );

    expect(within(screen.getByRole("dialog")).getByText("pln")).toBeDefined();
    const nameInput = screen.getByLabelText("Biller Name");
    await user.clear(nameInput);
    await user.type(nameInput, "PLN Retail");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(lastBillerUpdateSlug).toBe("pln");
    expect(lastBillerUpdateBody).toEqual({ billerName: "PLN Retail" });
    expect(
      await screen.findByRole("heading", { name: "PLN Retail" })
    ).toBeDefined();
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add Endpoint" }));
    const billerSelector = screen.getByLabelText("Biller");
    await user.click(billerSelector);
    expect(
      await screen.findByRole("option", { name: "PLN Retail" })
    ).toBeDefined();
  });

  test("keeps the rename interaction open when the backend rejects the name", async () => {
    const user = userEvent.setup();
    shouldFailBillerUpdate = true;
    renderEndpointsPage();

    await user.click(
      await screen.findByRole("button", { name: "Edit biller PLN" })
    );
    const nameInput = screen.getByLabelText("Biller Name");
    await user.clear(nameInput);
    await user.type(nameInput, "PDAM");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(lastBillerUpdateSlug).toBe("pln");
      expect(lastBillerUpdateBody).toEqual({ billerName: "PDAM" });
    });
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByDisplayValue("PDAM")).toBeDefined();
  });

  test("filters the catalog to the selected biller and defaults creation to it", async () => {
    const user = userEvent.setup();
    extraCatalogEndpoint = pdamEndpoint;
    renderEndpointsPage(["/dashboard/endpoints?billerSlug=pdam"]);

    expect(
      await screen.findByRole("button", { name: pdamEndpointButtonName })
    ).toBeDefined();
    expect(
      screen.queryByRole("button", { name: endpointButtonName })
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add Endpoint" }));

    expect(
      within(screen.getByLabelText("Biller")).getByText("PDAM")
    ).toBeDefined();
  });

  test("keeps an unknown biller URL scoped instead of showing other endpoints", async () => {
    extraCatalogEndpoint = pdamEndpoint;
    renderEndpointsPage(["/dashboard/endpoints?billerSlug=unknown"]);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: endpointButtonName })
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: pdamEndpointButtonName })
      ).toBeNull();
    });
    expect(await screen.findByText("Biller not found")).toBeDefined();
  });

  test("keeps a malformed biller URL scoped instead of showing other endpoints", async () => {
    extraCatalogEndpoint = pdamEndpoint;
    renderEndpointsPage(["/dashboard/endpoints?billerSlug=%20"]);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: endpointButtonName })
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: pdamEndpointButtonName })
      ).toBeNull();
    });
    expect(await screen.findByText("Biller not found")).toBeDefined();
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
    expect(screen.getByText("Biller is required")).toBeDefined();
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

  test.each([
    "grid",
    "list",
  ] as const)("edits an endpoint from the %s view without changing its biller", async (viewMode) => {
    const user = userEvent.setup();
    localStorage.setItem("endpoints-view-mode", JSON.stringify(viewMode));
    renderEndpointsPage();

    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    const closedEditSheet = document.querySelector(
      '[data-slot="sheet-content"]'
    );
    expect(closedEditSheet).toBeDefined();
    expect(closedEditSheet?.getAttribute("data-closed")).toBe("");

    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit endpoint" })
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBe(closedEditSheet as HTMLElement);
    expect(within(dialog).getByDisplayValue("/inquiry")).toBeDefined();
    expect(within(dialog).getByText("PLN")).toBeDefined();

    await user.click(within(dialog).getByLabelText("Method"));
    await user.click(await screen.findByRole("option", { name: "POST" }));
    await user.clear(within(dialog).getByLabelText("URL"));
    await user.type(within(dialog).getByLabelText("URL"), "/payment");
    await user.click(
      within(dialog).getByRole("button", { name: "Save Changes" })
    );

    await waitFor(() => {
      expect(lastUpdateBody).toEqual({ method: "POST", url: "/payment" });
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.getByText("/payment")).toBeDefined();
    });
  });

  test("constrains long endpoint paths in grid cards", async () => {
    const longPath =
      "/xapi-pbb/api/payment/inquiry/with-a-very-long-resource-name";
    currentEndpoint = { ...endpoints[0], url: longPath };
    renderEndpointsPage();

    const path = await screen.findByText(longPath);
    expect(path.className).toContain("truncate");
    expect(path.parentElement?.className).toContain("w-full");
  });

  test("keeps the edit sheet open when the update fails", async () => {
    const user = userEvent.setup();
    shouldFailUpdate = true;
    renderEndpointsPage();

    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit endpoint" })
    );

    const dialog = await screen.findByRole("dialog");
    await user.clear(within(dialog).getByLabelText("URL"));
    await user.type(within(dialog).getByLabelText("URL"), "/payment");
    await user.click(
      within(dialog).getByRole("button", { name: "Save Changes" })
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(
        within(screen.getByRole("dialog")).getByDisplayValue("/payment")
      ).toBeDefined();
    });
  });

  test("removes an edited endpoint that no longer matches the search", async () => {
    const user = userEvent.setup();
    renderEndpointsPage();

    await user.type(
      await screen.findByPlaceholderText("Search endpoints..."),
      "/inquiry"
    );
    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Edit endpoint" })
    );

    const dialog = await screen.findByRole("dialog");
    await user.clear(within(dialog).getByLabelText("URL"));
    await user.type(within(dialog).getByLabelText("URL"), "/payment");
    await user.click(
      within(dialog).getByRole("button", { name: "Save Changes" })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: endpointButtonName })
      ).toBeNull();
    });
  });

  test.each([
    "grid",
    "list",
  ] as const)("deletes an endpoint from the %s view after confirmation and preserves catalog state", async (viewMode) => {
    const user = userEvent.setup();
    localStorage.setItem("endpoints-view-mode", JSON.stringify(viewMode));
    renderEndpointsPage();

    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    const searchInput = await screen.findByPlaceholderText(
      "Search endpoints..."
    );
    await user.type(searchInput, "/inquiry");
    expect((searchInput as HTMLInputElement).value).toBe("/inquiry");

    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete endpoint" })
    );

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("GET /inquiry")).toBeDefined();
    expect(within(dialog).getByText(configuredResponseName)).toBeDefined();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(lastDeleteId).toBeNull();
    expect(
      screen.getByRole("button", { name: endpointButtonName })
    ).toBeDefined();

    act(() => {
      fireEvent.contextMenu(
        screen.getByRole("button", { name: endpointButtonName })
      );
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete endpoint" })
    );
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete Endpoint",
      })
    );

    await waitFor(() => {
      expect(lastDeleteId).toBe("endpoint-1");
      expect(
        screen.queryByRole("button", { name: endpointButtonName })
      ).toBeNull();
    });
    expect(
      (screen.getByPlaceholderText("Search endpoints...") as HTMLInputElement)
        .value
    ).toBe("/inquiry");
    expect(
      screen
        .getByRole("button", {
          name: `${viewMode === "grid" ? "Grid" : "List"} view`,
        })
        .getAttribute("aria-pressed")
    ).toBe("true");
  });

  test("disables duplicate deletion while the request is pending", async () => {
    const user = userEvent.setup();
    holdDeleteRequest = true;
    renderEndpointsPage();

    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete endpoint" })
    );
    const dialog = await screen.findByRole("alertdialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: "Delete Endpoint",
    });

    await user.click(confirmButton);
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);
    expect(lastDeleteId).toBe("endpoint-1");
    expect(deleteRequestResolver).not.toBeNull();

    deleteRequestResolver?.();
  });

  test("keeps a failed deletion visible and the confirmation open", async () => {
    const user = userEvent.setup();
    shouldFailDelete = true;
    renderEndpointsPage();

    const endpointButton = await screen.findByRole("button", {
      name: endpointButtonName,
    });
    act(() => {
      fireEvent.contextMenu(endpointButton);
    });
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete endpoint" })
    );
    await user.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Delete Endpoint",
      })
    );

    await waitFor(() => {
      expect(lastDeleteId).toBe("endpoint-1");
      expect(screen.getByRole("alertdialog")).toBeDefined();
      expect(
        screen.getByRole("button", {
          hidden: true,
          name: endpointButtonName,
        })
      ).toBeDefined();
    });
  });

  test("does not expose endpoint edit actions without permission", async () => {
    localStorage.removeItem("auth_token");
    renderEndpointsPage();

    expect(
      await screen.findByRole("button", { name: endpointButtonName })
    ).toBeDefined();
    expect(screen.queryByText("Edit endpoint")).toBeNull();
    expect(screen.queryByText("Delete endpoint")).toBeNull();
  });
});
