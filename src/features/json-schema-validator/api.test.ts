import { afterEach, describe, expect, mock, test } from "bun:test";
import { validateJsonSchema } from "@/features/json-schema-validator/api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("validateJsonSchema", () => {
  test("serializes the editor content and validation controls", async () => {
    const fetchMock = mock(async () =>
      Response.json({
        responseCode: "00",
        responseDesc: "success",
        data: {
          outcome: "VALIDATION_RESULT",
          valid: true,
          resolvedDialect: "DRAFT_7",
          errorCount: 0,
          truncated: false,
          durationMs: 3,
          diagnostics: [],
        },
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await validateJsonSchema({
      schema: '{"type":"string"}',
      instance: '"value"',
      dialect: "DRAFT_7",
      formatAssertions: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, config] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/api/tools/json-schema/validate");
    expect(config.method).toBe("POST");
    expect(JSON.parse(String(config.body))).toEqual({
      schema: '{"type":"string"}',
      instance: '"value"',
      dialect: "DRAFT_7",
      formatAssertions: false,
    });
  });
});
