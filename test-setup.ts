/**
 * Test setup file for Bun tests
 * This file configures the DOM environment using happy-dom
 */
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

afterEach(() => {
  if (document.body) {
    document.body.innerHTML = "";
  }
  if (document.head) {
    document.head.innerHTML = "";
  }
});
