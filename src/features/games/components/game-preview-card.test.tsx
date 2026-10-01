import { afterEach, describe, expect, mock, test, vi } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";

import { StrictMode } from "react";

let reducedMotion = false;
mock.module("motion/react", () => ({ useReducedMotion: () => reducedMotion }));
const { GamePreviewMedia } = await import("./game-preview-card");
const first =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=#first";
const second = first.replace("#first", "#second");
const media = { screenshots: [first, second] };

afterEach(() => {
  cleanup();
  reducedMotion = false;
  vi.useRealTimers();
});

function visibleFrame(container: HTMLElement) {
  return container.querySelector("img.opacity-100")?.getAttribute("src");
}

describe("game preview media lifecycle", () => {
  test("cycles gameplay frames and cancels the timer when the panel closes", () => {
    vi.useFakeTimers();
    const clearInterval = vi.spyOn(window, "clearInterval");
    const view = render(<GamePreviewMedia cover="/cover.jpg" media={media} />);
    expect(visibleFrame(view.container)).toBe(first);
    act(() => vi.advanceTimersByTime(2500));
    expect(visibleFrame(view.container)).toBe(second);
    view.unmount();
    expect(clearInterval).toHaveBeenCalled();
    clearInterval.mockRestore();
  });

  test("skips broken frames and returns to the cover if all previews fail", () => {
    const view = render(<GamePreviewMedia cover="/cover.jpg" media={media} />);
    fireEvent.error(view.container.querySelectorAll("img")[1]);
    expect(visibleFrame(view.container)).toBe(second);
    fireEvent.error(view.container.querySelectorAll("img")[1]);
    expect(view.container.querySelectorAll("img")).toHaveLength(1);
    expect(view.container.querySelector("img")?.getAttribute("src")).toBe(
      "/cover.jpg"
    );
  });

  test("keeps reduced-motion previews static and does not autoplay video", () => {
    vi.useFakeTimers();
    reducedMotion = true;
    const view = render(
      <GamePreviewMedia
        cover="/cover.jpg"
        media={{ ...media, video: "/clip.webm" }}
      />
    );
    act(() => vi.advanceTimersByTime(10_000));
    expect(visibleFrame(view.container)).toBe(first);
    expect(view.container.querySelector("video")).toBeNull();
  });

  test("falls back to screenshots when video playback is rejected", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValue(new Error("Autoplay blocked"));
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    const view = render(
      <GamePreviewMedia
        cover="/cover.jpg"
        media={{ ...media, video: "/clip.webm" }}
      />
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.container.querySelector("video")).toBeNull();
    expect(visibleFrame(view.container)).toBe(first);
    expect(pause).toHaveBeenCalled();
    play.mockRestore();
    pause.mockRestore();
  });
  test("ignores playback rejection from a cancelled Strict Mode effect", async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined)
      .mockRejectedValueOnce(
        new DOMException("Playback interrupted", "AbortError")
      );
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    const view = render(
      <StrictMode>
        <GamePreviewMedia
          cover="/cover.jpg"
          media={{ ...media, video: "/clip.webm" }}
        />
      </StrictMode>
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(view.container.querySelector("video")).not.toBeNull();
    expect(play).toHaveBeenCalledTimes(2);
    view.unmount();
    play.mockRestore();
    pause.mockRestore();
  });
});
