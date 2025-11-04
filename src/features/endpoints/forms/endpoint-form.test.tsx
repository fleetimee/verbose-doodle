import { beforeEach, describe, expect, mock, test } from "bun:test";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import {
  EndpointForm,
  type EndpointFormHandle,
} from "@/features/endpoints/forms/endpoint-form";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";

const SUBMIT_BUTTON_LABEL = "Save Endpoint";

describe("EndpointForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  test("renders default values and highlights the selected method", () => {
    const handleSubmit = mock((_data: EndpointFormData) => {});
    render(
      <EndpointForm onSubmit={handleSubmit}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    const methodTrigger = screen.getByLabelText("Method");
    expect(methodTrigger).toBeDefined();

    const methodLabel = within(methodTrigger).getByText("GET");
    expect(methodLabel.className).toContain("text-blue-600");

    const urlInput = screen.getByLabelText("URL") as HTMLInputElement;
    expect(urlInput.value).toBe("/rest");

    const billerTrigger = screen.getByLabelText("Biller");
    expect(billerTrigger).toBeDefined();
  });

  test("coerces numeric values before calling onSubmit", async () => {
    const user = userEvent.setup();
    const handleSubmit = mock((_data: EndpointFormData) => {});

    render(
      <EndpointForm onSubmit={handleSubmit}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_LABEL }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const firstCall = handleSubmit.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) {
      throw new Error("Expected handleSubmit to receive submission payload");
    }

    const [payload] = firstCall;
    expect(payload).toEqual({ billerId: 1, method: "GET", url: "/rest" });
  });

  test("displays validation errors from the schema on submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = mock((_data: EndpointFormData) => {});

    render(
      <EndpointForm onSubmit={handleSubmit}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    const urlInput = screen.getByLabelText("URL") as HTMLInputElement;
    await user.clear(urlInput);
    await user.type(urlInput, "/");

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_LABEL }));

    expect(
      screen.getByText(
        "URL must be a valid API path (e.g., /rest, /rest/api, /api/v1/users)"
      )
    ).toBeDefined();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("exposes imperative form methods through the ref", () => {
    const handleSubmit = mock((_data: EndpointFormData) => {});
    const formRef = createRef<EndpointFormHandle>();

    render(
      <EndpointForm onSubmit={handleSubmit} ref={formRef}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    expect(formRef.current).toBeDefined();
    if (!formRef.current) {
      throw new Error("Expected form ref to be defined");
    }

    act(() => {
      formRef.current?.form.setValue("url", "/custom");
    });

    expect(formRef.current.getValues().url).toBe("/custom");

    act(() => {
      formRef.current?.reset();
    });

    expect(formRef.current.getValues()).toEqual({
      billerId: 1,
      method: "GET",
      url: "/rest",
    });
  });
});
