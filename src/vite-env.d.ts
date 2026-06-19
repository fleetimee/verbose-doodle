/// <reference types="vite/client" />

// View Transitions API
declare global {
  interface Document {
    startViewTransition?: (callback: () => void) => ViewTransition;
  }

  interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    skipTransition: () => void;
    updateCallbackDone: Promise<void>;
  }
}

export {};
