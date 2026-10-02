import { afterEach, beforeEach, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import type { ServerEntry } from "@/features/server-inventory/types";
import { setActiveLocale } from "@/lib/i18n";
import { ServerInventoryPage } from "@/pages/dashboard/server-inventory";

const connectionInstructions = /Connection instructions/;
const originalFetch = globalThis.fetch;
const baseEntry: ServerEntry = {
  id: "entry-1",
  name: "Linux",
  accessType: "SSH",
  host: "192.0.2.1",
  port: null,
  url: null,
  username: "root",
  hasPassword: true,
  databaseEngine: null,
  databaseName: null,
  notes: "Development server",
  createdAt: "2026-10-02T00:00:00Z",
  updatedAt: "2026-10-02T00:00:00Z",
};
let entries: ServerEntry[];
let lastSave: Record<string, unknown> | null;
let revealCalls: number;
let resolveReveal: ((response: Response) => void) | null;
let holdReveal: boolean;
let failSave: boolean;
let failDelete: boolean;
let queryClient: QueryClient;
let listRequests: URLSearchParams[];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  localStorage.clear();
  setActiveLocale("en-US");
  entries = [{ ...baseEntry }];
  listRequests = [];
  lastSave = null;
  revealCalls = 0;
  resolveReveal = null;
  holdReveal = false;
  failSave = false;
  failDelete = false;
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const mockFetch = (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: Parameters<typeof globalThis.fetch>[1]
  ): Promise<Response> => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.startsWith("/api/servers?") && method === "GET") {
      const params = new URL(url, "http://test.local").searchParams;
      listRequests.push(params);
      const search = (params.get("search") ?? "").toLowerCase();
      const type = params.get("accessType");
      const engine = params.get("databaseEngine");
      const filtered = entries.filter(
        (entry) =>
          (!type || entry.accessType === type) &&
          (!engine || entry.databaseEngine === engine) &&
          (!search ||
            [
              entry.name,
              entry.host,
              entry.username,
              entry.notes,
              entry.accessType,
              entry.databaseEngine,
              entry.databaseName,
              entry.url,
            ].some((value) => value?.toLowerCase().includes(search)))
      );
      const sortBy = params.get("sortBy") as keyof ServerEntry;
      filtered.sort(
        (a, b) =>
          String(a[sortBy]).localeCompare(String(b[sortBy])) *
          (params.get("direction") === "desc" ? -1 : 1)
      );
      const page = Number(params.get("page"));
      const size = Number(params.get("size"));
      const hosts = [...new Set(filtered.map((entry) => entry.host))];
      const pageHosts = hosts.slice(page * size, (page + 1) * size);
      const pagedEntries = pageHosts.flatMap((host) =>
        filtered.filter((entry) => entry.host === host)
      );
      return Promise.resolve(
        json({
          data: {
            servers: pagedEntries,
            totalElements: filtered.length,
            totalPages: Math.ceil(hosts.length / size),
            totalHosts: hosts.length,
            page,
            size,
            accessTypes: [...new Set(entries.map((entry) => entry.accessType))],
            databaseEngines: [
              ...new Set(
                entries.map((entry) => entry.databaseEngine).filter(Boolean)
              ),
            ],
          },
        })
      );
    }
    if (url === "/api/servers/hosts") {
      return Promise.resolve(
        json({ data: { hosts: ["192.0.2.1", "192.0.2.99"] } })
      );
    }
    if (url === "/api/servers/access-types") {
      return Promise.resolve(json({ data: { accessTypes: ["SSH"] } }));
    }
    if (url.endsWith("/password/reveal")) {
      revealCalls++;
      if (holdReveal) {
        return new Promise((resolve) => {
          resolveReveal = resolve;
        });
      }
      return Promise.resolve(
        json({ data: { password: "fake-revealed-secret" } })
      );
    }
    if (method === "POST" || method === "PUT") {
      lastSave = JSON.parse(String(init?.body));
      if (failSave) {
        return Promise.resolve(json({ responseDesc: "Save failed" }, 500));
      }
      const entry = { ...baseEntry, ...lastSave };
      entries = [entry];
      return Promise.resolve(json({ data: { server: entry } }));
    }
    if (method === "DELETE") {
      if (failDelete) {
        return Promise.resolve(json({ responseDesc: "Delete failed" }, 500));
      }
      entries = [];
      return Promise.resolve(json({ data: null }));
    }
    return Promise.reject(new Error(`Unexpected request: ${method} ${url}`));
  };
  globalThis.fetch = Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect,
  });
});

afterEach(() => {
  queryClient.clear();
  globalThis.fetch = originalFetch;
  localStorage.clear();
});

function renderPage(role: "ADMIN" | "USER" = "ADMIN") {
  const payload = btoa(
    JSON.stringify({ role, user_id: "user-1", username: "test-user" })
  );
  localStorage.setItem("auth_token", `header.${payload}.signature`);
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ServerInventoryPage />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

async function editEntry(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("row", { name: "View details for Linux" })
  );
  await user.click(await screen.findByRole("button", { name: "Edit entry" }));
  return screen.findByRole("dialog", { name: "Edit server entry" });
}

test("metadata edits omit passwords and keep failed saves editable", async () => {
  const user = userEvent.setup();
  renderPage();
  const dialog = await editEntry(user);
  await user.clear(within(dialog).getByLabelText("Name"));
  await user.type(within(dialog).getByLabelText("Name"), "Edited Linux");
  failSave = true;
  await user.click(within(dialog).getByRole("button", { name: "Save entry" }));
  await screen.findByRole("alert");
  expect(lastSave).not.toHaveProperty("password");
  expect(within(dialog).getByDisplayValue("Edited Linux")).toBeDefined();
  failSave = false;
  await user.click(within(dialog).getByRole("button", { name: "Save entry" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(await screen.findByText("Edited Linux")).toBeDefined();
  expect(
    JSON.stringify(
      queryClient
        .getMutationCache()
        .getAll()
        .map((mutation) => mutation.state)
    )
  ).not.toContain("secret");
});

test("creates a custom access type through the picker", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const dialog = await screen.findByRole("dialog");
  await user.type(within(dialog).getByLabelText("Name"), "SCP access");
  await user.type(within(dialog).getByLabelText("Host"), "192.0.2.2");
  await user.click(
    within(dialog).getByRole("combobox", { name: "Access type" })
  );
  await user.type(
    await screen.findByPlaceholderText("Find or create an access type..."),
    "scp"
  );
  await user.click(await screen.findByRole("option", { name: 'Create "SCP"' }));
  await user.click(within(dialog).getByRole("button", { name: "Save entry" }));
  await waitFor(() => expect(lastSave?.accessType).toBe("SCP"));
});

test("password reveal never enters the shared query cache and must be requested again", async () => {
  const user = userEvent.setup();
  renderPage();
  expect(revealCalls).toBe(0);
  await user.click(
    await screen.findByRole("button", { name: "Reveal password for Linux" })
  );
  await screen.findByText("fake-revealed-secret");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    JSON.stringify(
      queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data)
    )
  ).not.toContain("fake-revealed-secret");
  await user.click(
    screen.getByRole("button", { name: "Hide password for Linux" })
  );
  await waitFor(() =>
    expect(screen.queryByText("fake-revealed-secret")).toBeNull()
  );
  await user.click(
    screen.getByRole("button", { name: "Reveal password for Linux" })
  );
  await screen.findByText("fake-revealed-secret");
  expect(revealCalls).toBe(2);
});

test("ignores a reveal response that arrives after the inline reveal is hidden", async () => {
  const user = userEvent.setup();
  holdReveal = true;
  renderPage();
  await user.click(
    await screen.findByRole("button", { name: "Reveal password for Linux" })
  );
  await waitFor(() => expect(resolveReveal).not.toBeNull());
  await user.click(
    screen.getByRole("button", { name: "Hide password for Linux" })
  );
  await act(async () => {
    resolveReveal?.(json({ data: { password: "late-secret" } }));
    await Promise.resolve();
  });
  expect(screen.queryByText("late-secret")).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("inline password reveal expires after 30 seconds", async () => {
  const user = userEvent.setup();
  renderPage();
  const revealButton = await screen.findByRole("button", {
    name: "Reveal password for Linux",
  });
  const originalTimer = window.setTimeout;
  let expire: (() => void) | undefined;
  window.setTimeout = ((
    handler: TimerHandler,
    delay?: number,
    ...args: unknown[]
  ) => {
    if (delay === 30_000 && typeof handler === "function" && !expire) {
      expire = () => handler(...args);
    }
    return originalTimer(handler, delay, ...args);
  }) as typeof window.setTimeout;
  try {
    await user.click(revealButton);
    await screen.findByText("fake-revealed-secret");
    expect(expire).toBeDefined();
    await act(async () => expire?.());
    expect(screen.queryByText("fake-revealed-secret")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Reveal password for Linux" })
    ).toBeDefined();
  } finally {
    window.setTimeout = originalTimer;
  }
});

test("individual inline reveal clears when the tab is hidden", async () => {
  const user = userEvent.setup();
  const originalVisibility = Object.getOwnPropertyDescriptor(
    document,
    "visibilityState"
  );
  try {
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Reveal password for Linux" })
    );
    await screen.findByText("fake-revealed-secret");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    await act(async () =>
      document.dispatchEvent(new Event("visibilitychange"))
    );
    expect(screen.queryByText("fake-revealed-secret")).toBeNull();
  } finally {
    if (originalVisibility) {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    } else {
      Reflect.deleteProperty(document, "visibilityState");
    }
  }
});

test("requires deletion confirmation and preserves the entry on failure", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(
    await screen.findByRole("row", { name: "View details for Linux" })
  );
  await user.click(await screen.findByRole("button", { name: "Delete entry" }));
  const dialog = await screen.findByRole("alertdialog");
  expect(entries).toHaveLength(1);
  failDelete = true;
  await user.click(
    within(dialog).getByRole("button", { name: "Delete entry" })
  );
  await screen.findByRole("alert");
  expect(entries).toHaveLength(1);
  expect(screen.getByRole("alertdialog")).toBeDefined();
});

test("ordinary users can read entries but cannot edit or reveal credentials", async () => {
  const user = userEvent.setup();
  renderPage("USER");
  await screen.findByText("Linux");
  expect(screen.queryByRole("button", { name: "Add entry" })).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Actions for Linux" })
  ).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Reveal password for Linux" })
  ).toBeNull();
  expect(
    screen.queryByRole("switch", { name: "Reveal all passwords" })
  ).toBeNull();
  expect(revealCalls).toBe(0);
  await user.click(screen.getByRole("row", { name: "View details for Linux" }));
  const drawer = await screen.findByRole("dialog");
  expect(
    within(drawer).queryByRole("button", { name: "Edit entry" })
  ).toBeNull();
  expect(
    within(drawer).queryByRole("button", { name: "Delete entry" })
  ).toBeNull();
});

test("table switch reveals every entry without a dialog or query caching and hides on tab exit", async () => {
  entries.push({ ...baseEntry, id: "entry-2", name: "Second server" });
  const user = userEvent.setup();
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Reveal all passwords",
  });
  await user.click(toggle);
  await waitFor(() =>
    expect(screen.getAllByText("fake-revealed-secret")).toHaveLength(2)
  );
  expect(revealCalls).toBe(2);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    JSON.stringify(
      queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data)
    )
  ).not.toContain("fake-revealed-secret");
  await user.click(toggle);
  expect(screen.queryByText("fake-revealed-secret")).toBeNull();
  await user.click(toggle);
  await waitFor(() => expect(revealCalls).toBe(4));
  const originalVisibility = Object.getOwnPropertyDescriptor(
    document,
    "visibilityState"
  );
  try {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });
    expect(screen.queryByText("fake-revealed-secret")).toBeNull();
  } finally {
    if (originalVisibility) {
      Object.defineProperty(document, "visibilityState", originalVisibility);
    } else {
      Reflect.deleteProperty(document, "visibilityState");
    }
  }
});

test("table reveal ignores responses arriving after the switch is turned off", async () => {
  holdReveal = true;
  const user = userEvent.setup();
  renderPage();
  const toggle = await screen.findByRole("switch", {
    name: "Reveal all passwords",
  });
  await user.click(toggle);
  await waitFor(() => expect(resolveReveal).not.toBeNull());
  await user.click(toggle);
  await act(async () => {
    resolveReveal?.(json({ data: { password: "late-table-secret" } }));
    await Promise.resolve();
  });
  expect(screen.queryByText("late-table-secret")).toBeNull();
});

test("connection details stay out of table cells and open in a drawer for ordinary users", async () => {
  entries[0].notes = "Connection instructions\nSecond line";
  const user = userEvent.setup();
  renderPage("USER");
  const row = await screen.findByRole("row", {
    name: "View details for Linux",
  });
  expect(screen.queryByText(connectionInstructions)).toBeNull();
  await user.click(row);
  const drawer = await screen.findByRole("dialog");
  expect(within(drawer).getByText(connectionInstructions)).toBeDefined();
  await user.click(within(drawer).getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

test("row actions do not open details and keyboard activation does", async () => {
  const user = userEvent.setup();
  renderPage();
  const row = await screen.findByRole("row", {
    name: "View details for Linux",
  });
  await user.click(
    within(row).getByRole("button", { name: "Copy username for Linux" })
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  row.focus();
  await user.keyboard("{Enter}");
  expect(await screen.findByRole("dialog")).toBeDefined();
});

test("database engine icons and filtering distinguish database entries", async () => {
  entries = [
    {
      ...baseEntry,
      id: "pg",
      name: "Postgres server",
      accessType: "DATABASE",
      databaseEngine: "POSTGRESQL",
    },
    {
      ...baseEntry,
      id: "oracle",
      name: "Oracle server",
      accessType: "DATABASE",
      databaseEngine: "ORACLE",
    },
    { ...baseEntry },
  ];
  const user = userEvent.setup();
  renderPage("USER");
  await screen.findByRole("button", { name: "DATABASE · POSTGRESQL" });
  expect(
    screen.getByRole("button", { name: "DATABASE · ORACLE" })
  ).toBeDefined();
  await user.click(
    screen.getByRole("combobox", { name: "Filter by database engine" })
  );
  await user.click(await screen.findByRole("option", { name: "ORACLE" }));
  await waitFor(() => expect(screen.queryByText("Postgres server")).toBeNull());
  expect(screen.getByText("Oracle server")).toBeDefined();
  expect(screen.queryByText("Linux")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(await screen.findByText("Postgres server")).toBeDefined();
  expect(screen.getByText("Linux")).toBeDefined();
});

test.each([
  { host: "192.0.2.1", port: 9433, expected: "192.0.2.1:9433" },
  { host: "192.0.2.1", port: null, expected: "192.0.2.1" },
  { host: "2001:db8::1", port: 5432, expected: "[2001:db8::1]:5432" },
])(
  "host copy matches the displayed connection address: $expected",
  async ({ host, port, expected }) => {
    entries[0] = { ...baseEntry, host, port };
    const user = userEvent.setup();
    renderPage("USER");
    await screen.findByText(host);
    await user.click(
      screen.getByRole("button", { name: "Copy host for Linux" })
    );
    await waitFor(async () =>
      expect(await navigator.clipboard.readText()).toBe(expected)
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  }
);

test("table controls request server pages, sorting, and filters", async () => {
  entries = Array.from({ length: 51 }, (_, index) => ({
    ...baseEntry,
    id: `entry-${index}`,
    name: `Server ${String(index).padStart(2, "0")}`,
    host: `192.0.2.${index + 1}`,
  }));
  const user = userEvent.setup();
  renderPage("USER");
  await screen.findByText("Server 00");
  expect(screen.queryByText("Server 50")).toBeNull();
  expect(listRequests.at(-1)?.get("size")).toBe("50");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("Server 50");
  expect(listRequests.at(-1)?.get("page")).toBe("1");
  await user.click(screen.getByRole("button", { name: "Sort by Name" }));
  await waitFor(() =>
    expect(listRequests.at(-1)?.get("direction")).toBe("desc")
  );
  expect(listRequests.at(-1)?.get("page")).toBe("0");
  await user.type(
    screen.getByRole("textbox", {
      name: "Search name, host, account, or notes...",
    }),
    "Server 03"
  );
  await waitFor(() =>
    expect(listRequests.at(-1)?.get("search")).toBe("Server 03")
  );
  await waitFor(() => expect(screen.queryByText("Server 50")).toBeNull());
  expect(screen.getByText("Server 03")).toBeDefined();
});

test("shared host renders once above distinct access entries and stays together across pages", async () => {
  entries = [
    {
      ...baseEntry,
      id: "rdp",
      name: "Alpha Windows",
      accessType: "RDP",
      host: "192.0.2.56",
    },
    {
      ...baseEntry,
      id: "db",
      name: "Alpha Database",
      accessType: "DATABASE",
      databaseEngine: "SQLSERVER",
      host: "192.0.2.56",
      port: 1433,
    },
    ...Array.from({ length: 10 }, (_, index) => ({
      ...baseEntry,
      id: `host-${index}`,
      name: `Beta ${index}`,
      host: `192.0.2.${index + 100}`,
    })),
  ];
  const user = userEvent.setup();
  renderPage("USER");
  await screen.findByText("Alpha Windows");
  expect(screen.getAllByText("192.0.2.56")).toHaveLength(1);
  expect(screen.getByText("Alpha Database")).toBeDefined();
  expect(screen.getByText(":1433")).toBeDefined();
  await user.click(screen.getByRole("combobox", { name: "Hosts per page" }));
  await user.click(await screen.findByRole("option", { name: "10 hosts" }));
  await waitFor(() => expect(listRequests.at(-1)?.get("size")).toBe("10"));
  expect(screen.getByText("Alpha Windows")).toBeDefined();
  expect(screen.getByText("Alpha Database")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Next" }));
  await waitFor(() => expect(screen.queryByText("Alpha Windows")).toBeNull());
  expect(screen.queryByText("Alpha Database")).toBeNull();
});

test("entry host suggests existing hosts outside the loaded page and accepts a new address", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const dialog = await screen.findByRole("dialog");
  const host = within(dialog).getByLabelText("Host");
  await user.click(
    within(dialog).getByRole("button", {
      name: "Choose an existing host or enter a new IP address or hostname.",
    })
  );
  expect(
    await screen.findByRole("option", { name: "192.0.2.99" })
  ).toBeDefined();
  await user.click(screen.getByRole("option", { name: "192.0.2.99" }));
  expect((host as HTMLInputElement).value).toBe("192.0.2.99");
  await user.clear(host);
  await user.type(within(dialog).getByLabelText("Name"), "New host");
  await user.type(host, "192.0.2.250");
  await user.click(within(dialog).getByRole("button", { name: "Save entry" }));
  await waitFor(() => expect(lastSave?.host).toBe("192.0.2.250"));
});

test("host groups collapse independently and expand with the keyboard", async () => {
  entries = [
    { ...baseEntry },
    { ...baseEntry, id: "second", name: "Second access" },
    { ...baseEntry, id: "other", name: "Other host", host: "192.0.2.2" },
  ];
  const user = userEvent.setup();
  renderPage("USER");
  const toggle = await screen.findByRole("button", {
    name: "Collapse host 192.0.2.1",
  });
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  await user.click(toggle.closest("tr") as HTMLElement);
  expect(screen.queryByText("Linux")).toBeNull();
  expect(screen.queryByText("Second access")).toBeNull();
  expect(screen.getByText("Other host")).toBeDefined();
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await user.click(screen.getByRole("button", { name: "Copy host 192.0.2.1" }));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  toggle.focus();
  await user.keyboard("{Enter}");
  expect(screen.getByText("Linux")).toBeDefined();
  expect(screen.getByText("Second access")).toBeDefined();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("access type changes show matching fields and preserve entered database details", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const drawer = await screen.findByRole("dialog");
  expect(within(drawer).queryByLabelText("Database engine")).toBeNull();
  expect(within(drawer).queryByLabelText("Web URL")).toBeNull();
  const chooseType = async (type: string) => {
    await user.click(
      within(drawer).getByRole("combobox", { name: "Access type" })
    );
    await user.click(await screen.findByRole("option", { name: type }));
  };
  await chooseType("DATABASE");
  await user.click(
    within(drawer).getByRole("combobox", { name: "Database engine" })
  );
  await user.click(await screen.findByRole("option", { name: "PostgreSQL" }));
  await user.type(within(drawer).getByLabelText("Database name"), "billing");
  await chooseType("WEB");
  expect(within(drawer).getByLabelText("Web URL")).toBeDefined();
  await chooseType("DATABASE");
  expect(
    within(drawer).getByRole("combobox", { name: "Database engine" })
      .textContent
  ).toContain("PostgreSQL");
  expect(
    (within(drawer).getByLabelText("Database name") as HTMLInputElement).value
  ).toBe("billing");
});

test("SSH port is visible with default 22 and preserves a custom port across type changes", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const drawer = await screen.findByRole("dialog");
  const port = within(drawer).getByLabelText("Port") as HTMLInputElement;
  expect(port.value).toBe("22");
  await user.clear(port);
  await user.type(port, "2222");
  for (const type of ["DATABASE", "SSH"]) {
    await user.click(
      within(drawer).getByRole("combobox", { name: "Access type" })
    );
    await user.click(await screen.findByRole("option", { name: type }));
  }
  expect(
    (within(drawer).getByLabelText("Port") as HTMLInputElement).value
  ).toBe("2222");
  await user.type(within(drawer).getByLabelText("Name"), "SSH server");
  await user.type(within(drawer).getByLabelText("Host"), "192.0.2.22");
  await user.click(within(drawer).getByRole("button", { name: "Save entry" }));
  await waitFor(() => expect(lastSave?.port).toBe(2222));
});

test("access types offer standard ports without carrying SSH defaults into database entries", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const drawer = await screen.findByRole("dialog");
  for (const [type, expected] of [
    ["RDP", "3389"],
    ["SFTP", "22"],
    ["HTTP", "80"],
    ["HTTPS", "443"],
    ["DATABASE", ""],
  ]) {
    await user.click(
      within(drawer).getByRole("combobox", { name: "Access type" })
    );
    await user.click(await screen.findByRole("option", { name: type }));
    expect(
      (within(drawer).getByLabelText("Port") as HTMLInputElement).value
    ).toBe(expected);
  }
});

test("database engine picker saves custom engines", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Add entry" }));
  const drawer = await screen.findByRole("dialog");
  await user.type(within(drawer).getByLabelText("Name"), "Database");
  await user.type(within(drawer).getByLabelText("Host"), "192.0.2.80");
  await user.click(
    within(drawer).getByRole("combobox", { name: "Access type" })
  );
  await user.click(await screen.findByRole("option", { name: "DATABASE" }));
  await user.click(
    within(drawer).getByRole("combobox", { name: "Database engine" })
  );
  await user.type(
    await screen.findByPlaceholderText("Find or create a database engine..."),
    "firebird"
  );
  await user.click(
    await screen.findByRole("option", { name: 'Create "FIREBIRD"' })
  );
  await user.click(within(drawer).getByRole("button", { name: "Save entry" }));
  await waitFor(() => expect(lastSave?.databaseEngine).toBe("FIREBIRD"));
});
