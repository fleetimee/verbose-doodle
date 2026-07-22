import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";

describe("TechStackGrid", () => {
  test("filters technology categories and reveals card details", async () => {
    const user = userEvent.setup();
    render(<TechStackGrid />);

    const reactLink = screen.getByRole("link", { name: "React 19" });
    await user.hover(reactLink);
    expect(
      screen.getByText(
        "UI library with the new compiler for automatic memoization and concurrent rendering."
      )
    ).toBeDefined();
    await user.unhover(reactLink);

    await user.click(screen.getByRole("tab", { name: "UI & Styling" }));
    expect(screen.getByRole("link", { name: "Base UI" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "TypeScript" })).toBeNull();
  });
});
