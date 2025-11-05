// @ts-nocheck - Vercel serverless function (types loaded at runtime)
import type { VercelRequest, VercelResponse } from "@vercel/node";

const HTTP_INTERNAL_SERVER_ERROR = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get backend URL from environment variable
  const backendUrl =
    process.env.VITE_ENDPOINT_URL || "http://143.198.85.201:47382";

  // Get the path from the query parameter
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";

  // Construct the full backend URL
  const targetUrl = `${backendUrl}/${path}`;

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

    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
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
    console.error("Proxy error:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Proxy request failed" });
  }
}
