import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/theme-provider";
import { CodeGeneratorDialog } from "@/features/endpoints/components/code-generator-dialog";
import type { EndpointResponse } from "@/features/endpoints/types";

const response: EndpointResponse = {
  activated: true,
  id: "response-1",
  json: '{"ok":true}',
  name: "Success",
  statusCode: 200,
};

describe("CodeGeneratorDialog", () => {
  test("updates the generated snippet when the language changes", async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <CodeGeneratorDialog
          baseUrl="https://api.example.test"
          method="POST"
          onOpenChange={() => undefined}
          open
          path="/payments/inquiry"
          response={response}
        />
      </ThemeProvider>
    );

    const languageSelect = screen.getByRole("combobox", {
      name: "Language / Tool",
    });

    fireEvent.click(languageSelect);
    expect(
      document.querySelector('[data-slot="select-content"]')?.className
    ).toContain("pointer-events-auto");
    await userEvent
      .setup({ pointerEventsCheck: 0 })
      .click(await screen.findByRole("option", { name: "Python Requests" }));

    await waitFor(() => {
      expect(languageSelect.textContent).toContain("Python Requests");
      expect(document.body.textContent).toContain("import requests");
    });
  });
});
