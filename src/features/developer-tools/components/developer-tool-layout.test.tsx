import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";

describe("DeveloperToolLayout", () => {
  test("renders sidebar layout with title, description, and actions", async () => {
    const user = userEvent.setup();
    let resetClicked = false;
    let clearClicked = false;

    render(
      <MemoryRouter>
        <DeveloperToolLayout
          clearLabel="Clear"
          description="Tool description here"
          onClear={() => {
            clearClicked = true;
          }}
          onReset={() => {
            resetClicked = true;
          }}
          resetLabel="Reset example"
          title="Sample Tool"
        >
          <div>Tool Content</div>
        </DeveloperToolLayout>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Sample Tool" })
    ).toBeDefined();
    expect(screen.getByText("Tool description here")).toBeDefined();
    expect(screen.getByText("Tool Content")).toBeDefined();

    const resetButton = screen.getByRole("button", { name: "Reset example" });
    const clearButton = screen.getByRole("button", { name: "Clear" });

    await user.click(resetButton);
    expect(resetClicked).toBe(true);

    await user.click(clearButton);
    expect(clearClicked).toBe(true);
  });

  test("renders top-header layout when variant is top-header", () => {
    render(
      <MemoryRouter>
        <DeveloperToolLayout
          description="Top header description"
          title="Top Header Tool"
          variant="top-header"
        >
          <div>Main Canvas</div>
        </DeveloperToolLayout>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Top Header Tool" })
    ).toBeDefined();
    expect(screen.getByText("Top header description")).toBeDefined();
    expect(screen.getByText("Main Canvas")).toBeDefined();
  });
});
