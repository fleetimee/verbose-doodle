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

afterEach(() => {
  cleanup();
  if (document.body) {
    document.body.innerHTML = "";
  }
  if (document.head) {
    document.head.innerHTML = "";
  }
});
