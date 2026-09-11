import { describe, expect, mock, test, vi } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

mock.module("@/features/auth/context", () => ({
  SCREEN_LOCK_STORAGE_KEY: "workspace-lock-account",
  useAuth: () => ({ snapshot: { user: { username: "operator" } } }),
}));
const { LockScreenButton, ScreenLockProvider } = await import("./screen-lock");

describe("screen lock", () => {
  test("persists the lock across reload and directly unlocks when clicking unlock button", async () => {
    sessionStorage.clear();
    const view = render(
      <ScreenLockProvider>
        <LockScreenButton />
      </ScreenLockProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Lock screen" }));
    expect(sessionStorage.getItem("workspace-lock-account")).toBe("operator");
    expect(screen.getByRole("button", { name: "Unlock" })).toBeDefined();

    // Simulate page refresh: unmount and remount with sessionStorage preserved
    view.unmount();
    render(
      <ScreenLockProvider>
        <LockScreenButton />
      </ScreenLockProvider>
    );
    expect(sessionStorage.getItem("workspace-lock-account")).toBe("operator");

    const unlockButton = screen.getByRole("button", { name: "Unlock" });
    expect(unlockButton).toBeDefined();

    fireEvent.click(unlockButton);
    await waitFor(() =>
      expect(sessionStorage.getItem("workspace-lock-account")).toBeNull()
    );
  });

  test("automatically locks after 2.5 minutes of inactivity", () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    const view = render(
      <ScreenLockProvider>
        <div>Dashboard Content</div>
      </ScreenLockProvider>
    );

    expect(sessionStorage.getItem("workspace-lock-account")).toBeNull();
    expect(screen.queryByRole("button", { name: "Unlock" })).toBeNull();

    act(() => {
      vi.advanceTimersByTime(150_000);
    });

    expect(sessionStorage.getItem("workspace-lock-account")).toBe("operator");
    expect(screen.getByRole("button", { name: "Unlock" })).toBeDefined();

    view.unmount();
    vi.useRealTimers();
  });

  test("resets idle timer on user activity", () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    const view = render(
      <ScreenLockProvider>
        <div>Dashboard Content</div>
      </ScreenLockProvider>
    );

    expect(sessionStorage.getItem("workspace-lock-account")).toBeNull();

    // Advance 100 seconds (less than 150s)
    act(() => {
      vi.advanceTimersByTime(100_000);
    });
    expect(sessionStorage.getItem("workspace-lock-account")).toBeNull();

    // Trigger activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Advance another 100 seconds (total 200s, but only 100s since activity)
    act(() => {
      vi.advanceTimersByTime(100_000);
    });
    expect(sessionStorage.getItem("workspace-lock-account")).toBeNull();

    // Advance final 50 seconds to complete 150s since activity
    act(() => {
      vi.advanceTimersByTime(50_000);
    });
    expect(sessionStorage.getItem("workspace-lock-account")).toBe("operator");
    expect(screen.getByRole("button", { name: "Unlock" })).toBeDefined();

    view.unmount();
    vi.useRealTimers();
  });

  test("unlocks when pressing Enter key", async () => {
    sessionStorage.clear();
    render(
      <ScreenLockProvider>
        <LockScreenButton />
      </ScreenLockProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Lock screen" }));
    expect(sessionStorage.getItem("workspace-lock-account")).toBe("operator");

    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() =>
      expect(sessionStorage.getItem("workspace-lock-account")).toBeNull()
    );
  });
});
