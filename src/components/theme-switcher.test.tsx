import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "@/components/theme-switcher";

describe("ThemeSwitcher", () => {
  test("changes theme through a document view transition", async () => {
    const user = userEvent.setup();
    const onChange = mock(() => {});
    const startViewTransition = mock((update: () => void) => {
      update();
    });

    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: startViewTransition,
    });

    render(<ThemeSwitcher defaultValue="light" onChange={onChange} />);

    await user.click(await screen.findByRole("button", { name: "Dark theme" }));

    expect(onChange).toHaveBeenCalledWith("dark");
    expect(startViewTransition).toHaveBeenCalledTimes(1);
  });
});
