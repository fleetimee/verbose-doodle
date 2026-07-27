import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useTrafficLogScroll } from "@/features/endpoints/hooks/use-traffic-log-scroll";

function createViewport() {
  const viewport = document.createElement("div");
  Object.defineProperties(viewport, {
    clientHeight: { configurable: true, value: 560 },
    scrollHeight: { configurable: true, value: 1560 },
  });
  return viewport;
}

describe("useTrafficLogScroll", () => {
  test("starts at the latest traffic log and stays pinned while new logs arrive", () => {
    const viewport = createViewport();
    const viewportRef = { current: viewport };
    const { rerender } = renderHook(
      ({ autoRefresh, logs }) =>
        useTrafficLogScroll(viewportRef, logs, autoRefresh),
      { initialProps: { autoRefresh: true, logs: [{ id: "log-1" }] } }
    );

    expect(viewport.scrollTop).toBe(1560);

    rerender({
      autoRefresh: true,
      logs: [{ id: "log-1" }, { id: "log-2" }],
    });

    expect(viewport.scrollTop).toBe(1560);
  });

  test("preserves a manual position after the user scrolls away from the latest log", () => {
    const viewport = createViewport();
    const viewportRef = { current: viewport };
    const { rerender } = renderHook(
      ({ autoRefresh, logs }) =>
        useTrafficLogScroll(viewportRef, logs, autoRefresh),
      { initialProps: { autoRefresh: false, logs: [{ id: "log-1" }] } }
    );

    act(() => {
      viewport.scrollTop = 120;
      viewport.dispatchEvent(new Event("scroll"));
    });

    rerender({
      autoRefresh: false,
      logs: [{ id: "log-1" }, { id: "log-2" }],
    });

    expect(viewport.scrollTop).toBe(120);
  });

  test("returns to the latest log after a manual scroll when auto-refresh is enabled", () => {
    const viewport = createViewport();
    const viewportRef = { current: viewport };
    const { rerender } = renderHook(
      ({ autoRefresh, logs }) =>
        useTrafficLogScroll(viewportRef, logs, autoRefresh),
      { initialProps: { autoRefresh: true, logs: [{ id: "log-1" }] } }
    );

    act(() => {
      viewport.scrollTop = 120;
      viewport.dispatchEvent(new Event("scroll"));
    });

    rerender({
      autoRefresh: true,
      logs: [{ id: "log-1" }, { id: "log-2" }],
    });

    expect(viewport.scrollTop).toBe(1560);
  });
});
