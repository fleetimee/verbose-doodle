import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/mona-sans/latin-400.css";
import "@fontsource/mona-sans/latin-500.css";
import "@fontsource/mona-sans/latin-600.css";
import "@fontsource/mona-sans/latin-700.css";
import "@fontsource/geist-mono/latin-400.css";
import "@fontsource/geist-mono/latin-500.css";
import "./index.css";
import { App } from "@/app";

if (import.meta.env.DEV) {
  await import("react-grab");
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
