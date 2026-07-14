import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DeveloperToolsCatalog } from "@/features/developer-tools/components/developer-tools-catalog";

describe("DeveloperToolsCatalog", () => {
  test("groups every developer tool and links to its workspace", () => {
    render(
      <MemoryRouter>
        <DeveloperToolsCatalog />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Developer Tools", level: 1 })
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: "Validation" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Conversion" })).toBeDefined();

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
  });
});
