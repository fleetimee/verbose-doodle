import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/components/theme-provider";
import { AboutHeader } from "@/features/about/components/about-header";

const renderHeader = (
  theme: "dark" | "light",
  onLocaleChange?: (locale: "en-US" | "id-ID") => void
) =>
  render(
    <ThemeProvider defaultTheme={theme} storageKey="about-header-test-theme">
      <AboutHeader onLocaleChange={onLocaleChange} />
    </ThemeProvider>
  );

describe("AboutHeader", () => {
  beforeEach(() => {
    localStorage.removeItem("about-header-test-theme");
    localStorage.setItem("app-locale", "en-US");
  });

  test("uses the app icon in dark theme", () => {
    renderHeader("dark");

    const logo = screen.getByRole("img", { name: "Fleetime Labs" });
    expect(logo.getAttribute("src")).toBe("/brand/biller-app-icon.png");
  });

  test("uses the app icon in light theme", () => {
    renderHeader("light");

    const logo = screen.getByRole("img", { name: "Fleetime Labs" });
    expect(logo.getAttribute("src")).toBe("/brand/biller-app-icon.png");
  });

  test("switches locale and reports each change", async () => {
    const user = userEvent.setup();
    const localeChanges: string[] = [];
    renderHeader("light", (locale) => localeChanges.push(locale));

    await user.click(screen.getByRole("button", { name: "English (en-US)" }));
    expect(
      screen.getByRole("heading", { name: "Tentang Proyek Ini" })
    ).toBeDefined();

    await user.click(
      screen.getByRole("button", { name: "Bahasa Indonesia (id-ID)" })
    );
    expect(
      screen.getByRole("heading", { name: "About This Project" })
    ).toBeDefined();
    expect(localeChanges).toEqual(["id-ID", "en-US"]);
  });
});
