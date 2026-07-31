import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { JsonSchemaValidator } from "@/features/developer-tools/tools/json-schema-validator/components/json-schema-validator";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function renderValidator() {
  localStorage.setItem("json-schema-validator-tour-seen", "true");
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TourProvider closeable>
        <JsonSchemaValidator />
      </TourProvider>
    </QueryClientProvider>
  );
}

function successResponse(overrides: Record<string, unknown> = {}): Response {
  return Response.json({
    data: {
      diagnostics: [],
      durationMs: 2,
      errorCount: 0,
      outcome: "VALIDATION_RESULT",
      resolvedDialect: "DRAFT_2020_12",
      truncated: false,
      valid: true,
      ...overrides,
    },
    responseCode: "00",
    responseDesc: "success",
  });
}

describe("JsonSchemaValidator", () => {
  test("loads the example and validates by button and keyboard shortcut", async () => {
    const user = userEvent.setup();
    const fetchMock = mock(async () => successResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    renderValidator();

    expect(screen.getByText("JSON Schema Validator")).toBeDefined();
    expect(document.body.textContent).toContain("ayu@example.com");

    await user.click(screen.getByRole("button", { name: "Validate" }));
    expect(await screen.findByText("Document is valid")).toBeDefined();

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { ctrlKey: true, key: "Enter" })
      );
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  test("walks through the validator controls and editors", async () => {
    const user = userEvent.setup();
    renderValidator();

    await user.click(screen.getByRole("button", { name: "Start tour" }));
    expect(await screen.findByText("Choose validation rules")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Edit both documents")).toBeDefined();
  });

  test("sends the selected draft and format assertion setting", async () => {
    const user = userEvent.setup();
    const fetchMock = mock(async () => successResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    renderValidator();

    await user.click(screen.getByRole("combobox", { name: "Schema draft" }));
    await user.click(await screen.findByRole("option", { name: "Draft 7" }));
    await user.click(
      screen.getByRole("switch", { name: "Assert string formats" })
    );
    await user.click(screen.getByRole("button", { name: "Validate" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, config] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const request = JSON.parse(String(config.body));
    expect(request.dialect).toBe("DRAFT_7");
    expect(request.formatAssertions).toBeFalse();
  });

  test("keeps the last result while editors change and supports reset and clear", async () => {
    const user = userEvent.setup();
    globalThis.fetch = mock(async () =>
      successResponse()
    ) as unknown as typeof fetch;
    renderValidator();

    await user.click(screen.getByRole("button", { name: "Validate" }));
    expect(await screen.findByText("Document is valid")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await waitFor(() =>
      expect(document.body.textContent).not.toContain("ayu@example.com")
    );
    expect(screen.getByText("Document is valid")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Reset example" }));
    await waitFor(() =>
      expect(document.body.textContent).toContain("ayu@example.com")
    );
  });

  test("shows invalid diagnostics and copies a path-based message", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    globalThis.fetch = mock(async () =>
      successResponse({
        diagnostics: [
          {
            instancePath: "/email",
            keyword: "type",
            message: "must be string",
            schemaPath: "#/properties/email/type",
            source: "INSTANCE",
          },
        ],
        errorCount: 1,
        valid: false,
      })
    ) as unknown as typeof fetch;
    renderValidator();

    await user.click(screen.getByRole("button", { name: "Validate" }));
    expect(await screen.findByText("Document is invalid")).toBeDefined();
    expect(screen.getByText("/email")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Copy diagnostic 1" }));
    expect(writeText).toHaveBeenCalledWith("/email: must be string");
  });

  test("renders parse, schema, timeout, oversized, and unavailable states", async () => {
    const user = userEvent.setup();
    const responses = [
      successResponse({
        diagnostics: [{ message: "Unexpected token", source: "SCHEMA" }],
        errorCount: 1,
        outcome: "PARSE_ERROR",
        resolvedDialect: null,
        valid: null,
      }),
      successResponse({
        diagnostics: [{ message: "Invalid type", source: "SCHEMA" }],
        errorCount: 1,
        outcome: "SCHEMA_ERROR",
        valid: null,
      }),
      successResponse({
        outcome: "TIMEOUT",
        resolvedDialect: null,
        valid: null,
      }),
      Response.json(
        { responseCode: "413", responseDesc: "too large" },
        { status: 413 }
      ),
      Response.json(
        { responseCode: "503", responseDesc: "busy" },
        { status: 503 }
      ),
    ];
    globalThis.fetch = mock(
      async () => responses.shift() as Response
    ) as unknown as typeof fetch;
    renderValidator();

    for (const expected of [
      "JSON could not be parsed",
      "Schema is not valid",
      "Validation timed out",
      "Input is too large",
      "Validation service unavailable",
    ]) {
      await user.click(screen.getByRole("button", { name: "Validate" }));
      expect(await screen.findByText(expected)).toBeDefined();
    }
  });
});
