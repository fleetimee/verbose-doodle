import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const manualChunkGroups = {
  "base-ui": ["@base-ui/react", "@base-ui/utils"],
  charts: ["recharts"],
  "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
  "query-vendor": ["@tanstack/react-query"],
  "react-vendor": ["react", "react-dom", "react-router"],
  "ui-utils": [
    "lucide-react",
    "motion",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "cmdk",
    "sonner",
    "vaul",
    "embla-carousel-react",
    "react-resizable-panels",
    "react-day-picker",
    "date-fns",
    "input-otp",
  ],
} as const;

const SIMULATE_PROXY_PREFIX_REGEX = /^\/simulate/;

function getManualChunk(moduleId: string) {
  if (
    moduleId.includes("/node_modules/@codemirror/") ||
    moduleId.includes("/node_modules/@uiw/react-codemirror/")
  ) {
    return "codemirror";
  }

  for (const [chunkName, packages] of Object.entries(manualChunkGroups)) {
    if (
      packages.some((packageName) =>
        moduleId.includes(`/node_modules/${packageName}/`)
      )
    ) {
      return chunkName;
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      chunkSizeWarningLimit: 1700,
      rollupOptions: {
        output: {
          manualChunks: getManualChunk,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          changeOrigin: true,
          secure: false,
          target: env.VITE_ENDPOINT_URL,
          ws: true,
        },
        "/simulate": {
          changeOrigin: true,
          rewrite: (requestPath) =>
            requestPath.replace(SIMULATE_PROXY_PREFIX_REGEX, ""),
          secure: false,
          target: env.VITE_ENDPOINT_URL,
        },
      },
    },
  };
});
