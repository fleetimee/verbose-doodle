import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AboutHeader } from "./about-header";
import { AboutPage } from "./about-page";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("AboutPage accessibility", () => {
  test("renders a skip navigation link", () => {
    renderWithRouter(<AboutPage />);
    const skipLink = screen.getByRole("link", { name: /skip to main content/i });
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute("href")).toBe("#about-main-content");
  });

  test("main landmark has aria-label", () => {
    renderWithRouter(<AboutPage />);
    const main = screen.getByRole("main");
    expect(main.getAttribute("aria-label")).toBeTruthy();
  });

  test("main landmark has id for skip navigation target", () => {
    renderWithRouter(<AboutPage />);
    const main = screen.getByRole("main");
    expect(main.getAttribute("id")).toBe("about-main-content");
  });
});

describe("AboutHeader accessibility", () => {
  test("header has aria-labelledby pointing to h1", () => {
    render(<AboutHeader />);
    const header = screen.getByRole("banner");
    const labelId = header.getAttribute("aria-labelledby");
    expect(labelId).toBe("about-page-title");

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.getAttribute("id")).toBe("about-page-title");
  });

  test("page has exactly one h1", () => {
    render(<AboutHeader />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });
});
