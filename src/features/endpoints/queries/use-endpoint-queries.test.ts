import { describe, expect, test } from "bun:test";
import {
  fetchEndpoint,
  fetchEndpoints,
  useEndpointQueries,
} from "./use-endpoint-queries";

describe("useEndpointQueries seam", () => {
  test("exports all endpoint queries, mutations, and prefetch helpers", () => {

    expect(typeof fetchEndpoints).toBe("function");
    expect(typeof fetchEndpoint).toBe("function");
    expect(typeof useEndpointQueries).toBe("function");
  });
});
