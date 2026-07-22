import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { AboutPage } from "@/features/about/components/about-page";

describe("AboutPage", () => {
  beforeEach(() => {
    localStorage.setItem("app-locale", "en-US");
  });

  test("navigates back to the home route", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route element={<AboutPage />} path="/about" />
          <Route element={<h1>Home destination</h1>} path="/" />
        </Routes>
      </MemoryRouter>
    );

    const homeLink = screen.getByText("Return home");
    expect(homeLink.tagName).toBe("A");
    expect(homeLink.getAttribute("href")).toBe("/");

    await user.click(homeLink);

    expect(
      screen.getByRole("heading", { level: 1, name: "Home destination" })
    ).toBeDefined();
  });
});
