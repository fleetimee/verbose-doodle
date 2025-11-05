// @ts-nocheck - Vercel serverless function (types loaded at runtime)
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only proxy POST requests for /login (GET should show the React page)
  // This matches the behavior in vite.config.ts:29-33
  if (req.method !== "POST") {
    // Serve the index.html to let the SPA handle the route
    try {
      const indexPath = join(process.cwd(), "index.html");
      const html = readFileSync(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      return res.status(HTTP_OK).send(html);
    } catch {
      // Fallback if index.html not found
      return res.status(HTTP_NOT_FOUND).send("Not found");
    }
  }

  // POST request - proxy to backend
  const backendUrl =
    process.env.VITE_ENDPOINT_URL || "http://143.198.85.201:47382";
  const targetUrl = `${backendUrl}/login`;

  try {
    // Prepare headers for forwarding (filter out problematic headers)
    const forwardHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        forwardHeaders[key] = value;
      }
    }
    // Override host header for backend
    forwardHeaders.host = new URL(backendUrl).host;

    // Forward the POST request to the backend
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: JSON.stringify(req.body),
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send the response
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Serverless function error logging required for debugging
    console.error("Login proxy error:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Login request failed" });
  }
}
