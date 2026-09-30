import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider } from "@/features/auth/context";
import {
  clearManualLogout,
  markManualLogout,
} from "@/features/auth/manual-logout";

function LocationInspector() {
  const location = useLocation();
  // SAFETY: This fixture reads the return location written by ProtectedRoute.
  const from = (location.state as { from?: { pathname: string } } | null)?.from;

  return (
    <div>
      <span data-testid="pathname">{location.pathname}</span>
      <span data-testid="from-pathname">{from?.pathname ?? "none"}</span>
    </div>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test("redirects unauthenticated users to /login and preserves location in state", () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard/developer-tools/date-converter"]}
      >
        <AuthProvider>
          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
              path="/dashboard/developer-tools/date-converter"
            />
            <Route element={<LocationInspector />} path="/login" />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("pathname").textContent).toBe("/login");
    expect(screen.getByTestId("from-pathname").textContent).toBe(
      "/dashboard/developer-tools/date-converter"
    );
  });

  test("redirects manually logged out users to /logged-out and preserves location in state", () => {
    markManualLogout();

    render(
      <MemoryRouter
        initialEntries={["/dashboard/developer-tools/date-converter"]}
      >
        <AuthProvider>
          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
              path="/dashboard/developer-tools/date-converter"
            />
            <Route element={<LocationInspector />} path="/logged-out" />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("pathname").textContent).toBe("/logged-out");
    expect(screen.getByTestId("from-pathname").textContent).toBe(
      "/dashboard/developer-tools/date-converter"
    );

    clearManualLogout();
  });
});
