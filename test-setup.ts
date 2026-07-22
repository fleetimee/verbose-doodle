/**
 * Test setup file for Bun tests
 * This file configures the DOM environment using happy-dom
 */
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

if (!document.getAnimations) {
  document.getAnimations = () => [];
}

afterEach(async () => {
  const { cleanup } = await import("@testing-library/react");
  cleanup();
  if (document.body) {
    document.body.innerHTML = "";
  }
  if (document.head) {
    document.head.innerHTML = "";
  }
});
