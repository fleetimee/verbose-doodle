import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { AboutVersionFooter } from "@/features/about/components/about-version-footer";

describe("AboutVersionFooter component", () => {
  test("renders supplied release metadata and links", () => {
    render(
      <AboutVersionFooter
        buildTimestamp="2026-07-22 16:30 WIB"
        commitSha="abcdef123456"
        environment="Production"
        giteaCommitUrl="https://gitea.example/commit/abcdef123456"
        giteaReleasesUrl="https://gitea.example/releases"
        version="2.0.0"
      />
    );

    expect(screen.getByText("v2.0.0")).toBeDefined();
    expect(screen.getByText("Production")).toBeDefined();
    expect(screen.getByText("2026-07-22 16:30 WIB")).toBeDefined();
    expect(
      screen
        .getByTitle("View commit abcdef123456 on Gitea")
        .getAttribute("href")
    ).toBe("https://gitea.example/commit/abcdef123456");
    expect(
      screen.getByRole("link", { name: "Releases" }).getAttribute("href")
    ).toBe("https://gitea.example/releases");
  });
});
