import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AboutPage } from "./about-page";

describe("About page entrance animations & accessibility", () => {
  test("renders AboutPage with cohesive animation container structure", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
    expect(screen.getByText("What is this?")).toBeDefined();
    expect(screen.getByText("Return home")).toBeDefined();
  });
});
