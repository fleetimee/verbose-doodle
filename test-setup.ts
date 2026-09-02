/**
 * Test setup file for Bun tests
 * This file configures the DOM environment using happy-dom
 */
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const { cleanup } = await import("@testing-library/react");

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

if (!document.getAnimations) {
  document.getAnimations = () => [];
}

Element.prototype.animate = () =>
  ({
    addEventListener: () => {},
    cancel: () => {},
    currentTime: 0,
    finish: () => {},
    finished: Promise.resolve(),
    oncancel: null,
    onfinish: null,
    pause: () => {},
    play: () => {},
    playbackRate: 1,
    playState: "finished",
    ready: Promise.resolve(),
    removeEventListener: () => {},
    reverse: () => {},
    startTime: 0,
  }) as unknown as Animation;

afterEach(() => {
  cleanup();
  if (document.body) {
    document.body.innerHTML = "";
  }
  if (document.head) {
    document.head.innerHTML = "";
  }
});
