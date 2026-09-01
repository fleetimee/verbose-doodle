import { describe, expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { DeveloperToolsCatalog } from "@/features/developer-tools/components/developer-tools-catalog";

describe("DeveloperToolsCatalog", () => {
  test("groups every developer tool and links to its workspace", () => {
    localStorage.removeItem("developer-tools-view-mode");
    localStorage.removeItem("developer-tools-category");
    render(
      <MemoryRouter>
        <DeveloperToolsCatalog />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Developer Tools" })
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Validation" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Conversion" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Scheduling" })).toBeDefined();

    expect(
      screen
        .getByRole("link", { name: "Open JSON Schema Validator" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/json-schema-validator");
    expect(
      screen
        .getByRole("link", { name: "Open JSON/YAML Converter" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/json-yaml-converter");
    expect(
      screen
        .getByRole("link", { name: "Open Cron Parser" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/cron-parser");
    expect(
      screen
        .getByRole("link", { name: "Open Number Base Converter" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/number-base-converter");
    expect(
      screen
        .getByRole("link", { name: "Open ISO 8583 Generator" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/iso8583-generator");
    expect(
      screen
        .getByRole("link", { name: "Open Date Converter" })
        .getAttribute("href")
    ).toBe("/dashboard/developer-tools/date-converter");
  });

  test("filters categories and switches between grid and list views", async () => {
    const user = userEvent.setup();
    localStorage.removeItem("developer-tools-view-mode");
    localStorage.removeItem("developer-tools-category");
    render(
      <MemoryRouter>
        <DeveloperToolsCatalog />
      </MemoryRouter>
    );

    const gridView = screen.getByRole("button", { name: "Grid view" });
    expect(gridView.getAttribute("aria-pressed")).toBe("true");

    await user.click(screen.getByRole("button", { name: "Validation" }));
    expect(
      screen.getByRole("link", { name: "Open JSON Schema Validator" })
    ).toBeDefined();
    expect(
      screen.queryByRole("link", { name: "Open JSON/YAML Converter" })
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "All tools" }));
    expect(
      screen.getByRole("link", { name: "Open JSON/YAML Converter" })
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "List view" }));
    expect(
      screen
        .getByRole("button", { name: "List view" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    await waitFor(() =>
      expect(localStorage.getItem("developer-tools-view-mode")).toBe('"list"')
    );
  });

  test("falls back to grid for an invalid saved view", () => {
    localStorage.setItem("developer-tools-view-mode", '"columns"');
    localStorage.removeItem("developer-tools-category");

    render(
      <MemoryRouter>
        <DeveloperToolsCatalog />
      </MemoryRouter>
    );

    expect(
      screen
        .getByRole("button", { name: "Grid view" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "List view" })
        .getAttribute("aria-pressed")
    ).toBe("false");
  });
});
