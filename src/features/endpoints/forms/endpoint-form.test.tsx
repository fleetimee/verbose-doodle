import { beforeEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EndpointForm } from "@/features/endpoints/forms/endpoint-form";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";

const SUBMIT_BUTTON_LABEL = "Save Endpoint";

describe("EndpointForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  test("updates the URL preview as the path changes", async () => {
    const user = userEvent.setup();

    render(
      <EndpointForm onSubmit={() => {}}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    const urlInput = screen.getByLabelText("URL") as HTMLInputElement;
    await user.clear(urlInput);
    await user.type(urlInput, "/api/v1/users");

    expect(
      screen.getByText("GET http://localhost:8080/api/v1/users")
    ).toBeDefined();
  });

  test("submits the selected biller slug", async () => {
    const user = userEvent.setup();
    const handleSubmit = mock((_data: EndpointFormData) => {});

    render(
      <EndpointForm initialBillerSlug="pln" onSubmit={handleSubmit}>
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
    expect(payload).toEqual({
      billerSlug: "pln",
      method: "GET",
      url: "/rest",
    });
  });

  test("offers the add-biller action from the biller selector", async () => {
    const user = userEvent.setup();
    const handleAddBiller = mock(() => {});

    render(
      <EndpointForm onAddBiller={handleAddBiller} onSubmit={() => {}}>
        <button type="submit">{SUBMIT_BUTTON_LABEL}</button>
      </EndpointForm>
    );

    await user.click(screen.getByRole("combobox", { name: "Biller" }));
    await user.click(screen.getByRole("option", { name: "Add New Biller" }));

    expect(handleAddBiller).toHaveBeenCalledTimes(1);
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
});
