import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { Login } from "@/pages/login";

const TRAILING_PADDING_REGEX = /[=]+$/u;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(TRAILING_PADDING_REGEX, "");
}

function createJwtToken(username = "alice"): string {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: "ADMIN",
    user_id: "user-1",
    username,
  };

  return [
    toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    toBase64Url(JSON.stringify(payload)),
    toBase64Url("signature"),
  ].join(".");
}

function DestinationSpy() {
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
}

describe("Login page redirect", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test("redirects already authenticated user to the preserved 'from' location", () => {
    localStorage.setItem("auth_token", createJwtToken());
    localStorage.setItem("refresh_token", "refresh-token");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/login",
              state: {
                from: {
                  pathname: "/dashboard/developer-tools/date-converter",
                },
              },
            },
          ]}
        >
          <AuthProvider>
            <Routes>
              <Route element={<Login />} path="/login" />
              <Route
                element={<DestinationSpy />}
                path="/dashboard/developer-tools/date-converter"
              />
              <Route element={<DestinationSpy />} path="/dashboard" />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("current-location").textContent).toBe(
      "/dashboard/developer-tools/date-converter"
    );
  });

  test("redirects already authenticated user to query param redirect if present", () => {
    localStorage.setItem("auth_token", createJwtToken());
    localStorage.setItem("refresh_token", "refresh-token");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/login?redirect=%2Fdashboard%2Fdeveloper-tools%2Fdate-converter",
          ]}
        >
          <AuthProvider>
            <Routes>
              <Route element={<Login />} path="/login" />
              <Route
                element={<DestinationSpy />}
                path="/dashboard/developer-tools/date-converter"
              />
              <Route element={<DestinationSpy />} path="/dashboard" />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("current-location").textContent).toBe(
      "/dashboard/developer-tools/date-converter"
    );
  });
});
