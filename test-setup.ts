/**
 * Test setup file for Bun tests
 * This file configures the DOM environment using happy-dom
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register happy-dom globally to provide DOM APIs for React Testing Library
GlobalRegistrator.register();
