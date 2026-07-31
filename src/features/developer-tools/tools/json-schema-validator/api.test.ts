import { afterEach, describe, expect, mock, test } from "bun:test";
import { validateJsonSchema } from "@/features/developer-tools/tools/json-schema-validator/api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("validateJsonSchema", () => {
  test("serializes the editor content and validation controls", async () => {
    const fetchMock = mock(async () =>
      Response.json({
        data: {
          diagnostics: [],
          durationMs: 3,
          errorCount: 0,
          outcome: "VALIDATION_RESULT",
          resolvedDialect: "DRAFT_7",
          truncated: false,
          valid: true,
        },
        responseCode: "00",
        responseDesc: "success",
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await validateJsonSchema({
      dialect: "DRAFT_7",
      formatAssertions: false,
      instance: '"value"',
      schema: '{"type":"string"}',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, config] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/api/tools/json-schema/validate");
    expect(config.method).toBe("POST");
    expect(JSON.parse(String(config.body))).toEqual({
      dialect: "DRAFT_7",
      formatAssertions: false,
      instance: '"value"',
      schema: '{"type":"string"}',
    });
  });
});
