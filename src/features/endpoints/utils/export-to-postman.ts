import type { Endpoint, GroupedEndpoints } from "@/features/endpoints/types";
import { generateUUID } from "@/lib/utils";

/**
 * Postman Collection v2.1 format types
 */
type PostmanHeader = {
  key: string;
  value: string;
  type?: string;
};

type PostmanBody = {
  mode: string;
  raw?: string;
  options?: {
    raw?: {
      language: string;
    };
  };
};

type PostmanRequest = {
  method: string;
  header: PostmanHeader[];
  body?: PostmanBody;
  url: {
    raw: string;
    protocol?: string;
    host?: string[];
    path?: string[];
  };
};

type PostmanItem = {
  name: string;
  request: PostmanRequest;
  response: unknown[];
};

type PostmanFolder = {
  name: string;
  item: PostmanItem[];
};

type PostmanCollection = {
  info: {
    name: string;
    description: string;
    schema: string;
    _postman_id?: string;
  };
  item: PostmanFolder[];
};

/**
 * Parse URL into Postman-compatible format with {{baseUrl}} variable
 */
function parseUrl(url: string) {
  try {
    const urlObj = new URL(url);
    // Use {{baseUrl}} variable for the protocol and host
    const rawUrl = `{{baseUrl}}${urlObj.pathname}${urlObj.search}`;
    return {
      raw: rawUrl,
      host: ["{{baseUrl}}"],
      path: urlObj.pathname.split("/").filter((segment) => segment.length > 0),
    };
  } catch {
    // If URL is relative or invalid, prepend {{baseUrl}}
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return {
      raw: `{{baseUrl}}${cleanPath}`,
      host: ["{{baseUrl}}"],
      path: cleanPath.split("/").filter((segment) => segment.length > 0),
    };
  }
}

/**
 * Convert endpoint to Postman request item
 */
function endpointToPostmanItem(endpoint: Endpoint): PostmanItem {
  const headers: PostmanHeader[] = [
    {
      key: "Content-Type",
      value: "application/json",
      type: "text",
    },
  ];

  // Get the activated response or first response as example
  const activeResponse = endpoint.responses.find((r) => r.activated);
  const exampleResponse = activeResponse || endpoint.responses[0];

  const body: PostmanBody | undefined =
    endpoint.method !== "GET" && endpoint.method !== "DELETE"
      ? {
          mode: "raw",
          raw: exampleResponse?.json
            ? JSON.stringify(JSON.parse(exampleResponse.json), null, 2)
            : "{}",
          options: {
            raw: {
              language: "json",
            },
          },
        }
      : undefined;

  return {
    name: `${endpoint.method} ${endpoint.url}`,
    request: {
      method: endpoint.method,
      header: headers,
      ...(body && { body }),
      url: parseUrl(endpoint.url),
    },
    response: [],
  };
}

/**
 * Convert grouped endpoints to Postman collection format
 */
export function convertToPostmanCollection(
  groupedEndpoints: GroupedEndpoints[],
  collectionName = "Biller Simulator API"
): PostmanCollection {
  const folders: PostmanFolder[] = groupedEndpoints.map((group) => ({
    name: group.billerName,
    item: group.endpoints.map(endpointToPostmanItem),
  }));

  return {
    info: {
      name: collectionName,
      description: `Exported from Biller Simulator on ${new Date().toISOString()}`,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: generateUUID(),
    },
    item: folders,
  };
}

/**
 * Download JSON file to user's computer
 */
export function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/**
 * Postman Environment format
 */
type PostmanEnvironment = {
  id: string;
  name: string;
  values: Array<{
    key: string;
    value: string;
    type: string;
    enabled: boolean;
  }>;
  _postman_variable_scope: string;
};

/**
 * Milliseconds to seconds conversion factor
 */
const MS_TO_SECONDS = 1000;

/**
 * Get base URL from environment variable
 */
function getBaseUrl(): string {
  return import.meta.env.VITE_ENDPOINT_URL || "http://143.198.85.201:47382";
}

/**
 * Create Postman environment with baseUrl variable
 */
export function createPostmanEnvironment(
  environmentName = "Biller Simulator"
): PostmanEnvironment {
  const baseUrl = getBaseUrl();

  return {
    id: generateUUID(),
    name: environmentName,
    values: [
      {
        key: "baseUrl",
        value: baseUrl,
        type: "default",
        enabled: true,
      },
    ],
    _postman_variable_scope: "environment",
  };
}

/**
 * Export grouped endpoints to Postman collection and download as JSON
 */
export function exportToPostman(
  groupedEndpoints: GroupedEndpoints[],
  collectionName = "Biller Simulator API"
) {
  const collection = convertToPostmanCollection(
    groupedEndpoints,
    collectionName
  );
  const timestamp = Math.floor(Date.now() / MS_TO_SECONDS);
  const filename = `${collectionName.toLowerCase().replaceAll(" ", "-")}-${timestamp}.postman_collection.json`;

  downloadJson(collection, filename);
}

/**
 * Export Postman environment and download as JSON
 */
export function exportPostmanEnvironment(environmentName = "Biller Simulator") {
  const environment = createPostmanEnvironment(environmentName);
  const timestamp = Math.floor(Date.now() / MS_TO_SECONDS);
  const filename = `${environmentName.toLowerCase().replaceAll(" ", "-")}-${timestamp}.postman_environment.json`;

  downloadJson(environment, filename);
}

/**
 * Delay in milliseconds between file downloads
 */
const DOWNLOAD_DELAY_MS = 100;

/**
 * Export both collection and environment
 */
export function exportPostmanWithEnvironment(
  groupedEndpoints: GroupedEndpoints[],
  collectionName = "Biller Simulator API",
  environmentName = "Biller Simulator"
) {
  // Generate timestamp once for both files
  const timestamp = Math.floor(Date.now() / MS_TO_SECONDS);

  // Export collection
  const collection = convertToPostmanCollection(
    groupedEndpoints,
    collectionName
  );
  const collectionFilename = `${collectionName.toLowerCase().replaceAll(" ", "-")}-${timestamp}.postman_collection.json`;
  downloadJson(collection, collectionFilename);

  // Export environment after a small delay to ensure files don't conflict
  setTimeout(() => {
    const environment = createPostmanEnvironment(environmentName);
    const envFilename = `${environmentName.toLowerCase().replaceAll(" ", "-")}-${timestamp}.postman_environment.json`;
    downloadJson(environment, envFilename);
  }, DOWNLOAD_DELAY_MS);
}
