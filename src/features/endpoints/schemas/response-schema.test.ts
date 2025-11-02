import { describe, expect, test } from "bun:test";
import { responseSchema } from "@/features/endpoints/schemas/response-schema";

const VALID_RESPONSE_INPUT = {
  name: "Demo Response",
  json: '{"message":"ok"}',
  statusCode: 200,
  activated: true,
};

function getIssueMessage(
  result: ReturnType<typeof responseSchema.safeParse>,
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

describe("responseSchema", () => {
  test("accepts valid response data", () => {
    const result = responseSchema.safeParse(VALID_RESPONSE_INPUT);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw result.error;
    }

    expect(result.data).toEqual(VALID_RESPONSE_INPUT);
  });

  test("rejects malformed JSON payloads", () => {
    const result = responseSchema.safeParse({
      ...VALID_RESPONSE_INPUT,
      json: "{ invalid",
    });

    expect(getIssueMessage(result, "json")).toBe("Invalid JSON format");
  });

  test("enforces status codes within the 100-599 range", () => {
    const result = responseSchema.safeParse({
      ...VALID_RESPONSE_INPUT,
      statusCode: 99,
    });

    expect(getIssueMessage(result, "statusCode")).toBe(
      "Status code must be between 100-599"
    );
  });

  test("provides a helpful error when status code is not numeric", () => {
    const result = responseSchema.safeParse({
      ...VALID_RESPONSE_INPUT,
      statusCode: "200" as unknown as number,
    });

    expect(getIssueMessage(result, "statusCode")).toBe(
      "Invalid input: expected number, received string"
    );
  });
});
