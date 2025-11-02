import { describe, expect, test } from "bun:test";
import { endpointSchema } from "@/features/endpoints/schemas/endpoint-schema";

const VALID_ENDPOINT_INPUT = {
  method: "GET" as const,
  url: "/api/demo",
  billerId: 42,
};

function getIssueMessage(
  result: ReturnType<typeof endpointSchema.safeParse>,
  field: string
) {
  if (result.success) {
    throw new Error("Expected schema parse to fail");
  }

  const issue = result.error.issues.find(
    (candidate) => candidate.path[0] === field
  );
  return issue?.message;
}

describe("endpointSchema", () => {
  test("accepts valid endpoint data", () => {
    const result = endpointSchema.safeParse(VALID_ENDPOINT_INPUT);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw result.error;
    }

    expect(result.data).toEqual(VALID_ENDPOINT_INPUT);
  });

  test("requires URLs to start with a leading slash", () => {
    const result = endpointSchema.safeParse({
      ...VALID_ENDPOINT_INPUT,
      url: "api/demo",
    });

    expect(getIssueMessage(result, "url")).toBe("URL must start with /");
  });

  test("rejects URLs longer than 500 characters", () => {
    const overlyLongUrl = `/${"a".repeat(500)}`;
    const result = endpointSchema.safeParse({
      ...VALID_ENDPOINT_INPUT,
      url: overlyLongUrl,
    });

    expect(getIssueMessage(result, "url")).toBe(
      "URL must not exceed 500 characters"
    );
  });

  test("flags non-integer biller IDs", () => {
    const result = endpointSchema.safeParse({
      ...VALID_ENDPOINT_INPUT,
      billerId: 7.5,
    });

    expect(getIssueMessage(result, "billerId")).toBe(
      "Biller ID must be an integer"
    );
  });

  test("provides a helpful error when biller ID is not numeric", () => {
    const result = endpointSchema.safeParse({
      ...VALID_ENDPOINT_INPUT,
      billerId: "123" as unknown as number,
    });

    expect(getIssueMessage(result, "billerId")).toBe(
      "Biller ID must be a number"
    );
  });
});
