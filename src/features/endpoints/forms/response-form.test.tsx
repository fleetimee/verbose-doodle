import { beforeEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponseForm } from "@/features/endpoints/forms/response-form";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";

const SUBMIT_BUTTON_LABEL = "Save Response";

describe("ResponseForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  test("coerces numeric values and forwards submission data", async () => {
    const user = userEvent.setup();
    const handleSubmit = mock((_data: ResponseFormData) => {});

    render(
      <ResponseForm onSubmit={handleSubmit}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </ResponseForm>
    );

    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    await user.type(nameInput, "Success Response");

    const statusInput = screen.getByLabelText(
      "Status Code"
    ) as HTMLInputElement;
    await user.clear(statusInput);
    await user.type(statusInput, "404");

    const jsonTextarea = screen.getByLabelText(
      "JSON Response"
    ) as HTMLTextAreaElement;
    await user.clear(jsonTextarea);
    await user.click(jsonTextarea);
    await user.paste('{"error":"not_found"}');

    await user.click(screen.getByRole("switch", { name: "Activate" }));

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_LABEL }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const firstCall = handleSubmit.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (!firstCall) {
      throw new Error("Expected handleSubmit to receive submission payload");
    }

    const [payload] = firstCall;
    expect(payload).toEqual({
      activated: true,
      json: '{"error":"not_found"}',
      name: "Success Response",
      statusCode: 404,
    });
  });

  test("surfaces validation errors for invalid inputs", async () => {
    const user = userEvent.setup();
    const handleSubmit = mock((_data: ResponseFormData) => {});

    render(
      <ResponseForm onSubmit={handleSubmit}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </ResponseForm>
    );

    const jsonTextarea = screen.getByLabelText(
      "JSON Response"
    ) as HTMLTextAreaElement;
    await user.clear(jsonTextarea);
    await user.click(jsonTextarea);
    await user.paste("{ invalid");

    const statusInput = screen.getByLabelText(
      "Status Code"
    ) as HTMLInputElement;
    await user.clear(statusInput);
    await user.type(statusInput, "99");

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON_LABEL }));

    expect(screen.getByText("Invalid JSON format")).toBeDefined();
    expect(
      screen.getByText("Status code must be between 100-599")
    ).toBeDefined();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
