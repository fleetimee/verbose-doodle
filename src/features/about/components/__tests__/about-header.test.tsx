import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import { AboutHeader } from "@/features/about/components/about-header";

const renderHeader = (theme: "dark" | "light") =>
  render(
    <ThemeProvider defaultTheme={theme} storageKey="about-header-test-theme">
      <AboutHeader />
    </ThemeProvider>
  );

describe("AboutHeader", () => {
  beforeEach(() => {
    localStorage.removeItem("about-header-test-theme");
  });

  test("uses the dark logo in dark theme", () => {
    renderHeader("dark");

    const logo = screen.getByRole("img", { name: "Fleetime Labs" });
    expect(logo.getAttribute("src")).toBe("/logo-dark.svg");
  });

  test("uses the icon logo in light theme", () => {
    renderHeader("light");

    const logo = screen.getByRole("img", { name: "Fleetime Labs" });
    expect(logo.getAttribute("src")).toBe("/logo-icon.svg");
  });
});
