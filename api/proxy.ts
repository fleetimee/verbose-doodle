// @ts-nocheck - Vercel serverless function (types loaded at runtime)
import type { VercelRequest, VercelResponse } from "@vercel/node";

const HTTP_INTERNAL_SERVER_ERROR = 500;
const TRAILING_SLASH_REGEX = /\/$/;
const HEADERS_NOT_TO_FORWARD = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function buildTargetUrl(backendUrl: string, req: VercelRequest): URL {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const targetUrl = new URL(
    path,
    `${backendUrl.replace(TRAILING_SLASH_REGEX, "")}/`
  );
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        targetUrl.searchParams.append(key, item);
      }
    }
  }
  return targetUrl;
}

function createForwardHeaders(req: VercelRequest): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (HEADERS_NOT_TO_FORWARD.has(key.toLowerCase()) || value === undefined) {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      headers.append(key, item);
    }
  }
  return headers;
}

function createForwardBody(req: VercelRequest): BodyInit | undefined {
  if (req.method === "GET" || req.method === "HEAD" || req.body === undefined) {
    return;
  }
  if (typeof req.body === "string" || req.body instanceof Uint8Array) {
    return req.body;
  }
  return JSON.stringify(req.body);
}

function copyResponseHeaders(response: Response, res: VercelResponse): void {
  response.headers.forEach((value, key) => {
    if (
      !HEADERS_NOT_TO_FORWARD.has(key.toLowerCase()) &&
      key.toLowerCase() !== "set-cookie"
    ) {
      res.setHeader(key, value);
    }
  });
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    res.setHeader("set-cookie", cookies);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get backend URL from environment variable
  const backendUrl =
    process.env.VITE_ENDPOINT_URL || "http://192.168.4.79:37847";

  const targetUrl = buildTargetUrl(backendUrl, req);

  try {
    // Prepare headers for forwarding (filter out problematic headers)
    const forwardHeaders = createForwardHeaders(req);
    const body = createForwardBody(req);
    const serializedJsonBody =
      body !== undefined &&
      typeof req.body !== "string" &&
      !(req.body instanceof Uint8Array);
    if (
      serializedJsonBody ||
      (body !== undefined && !forwardHeaders.has("content-type"))
    ) {
      forwardHeaders.set("content-type", "application/json");
    }

    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    // Copy response headers
    copyResponseHeaders(response, res);

    // Send the response
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Proxy request failed" });
  }
}
