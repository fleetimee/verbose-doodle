import { describe, expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import { AboutContent } from "@/features/about/components/about-content";

const featureTitles = [
  "Endpoint Management:",
  "Developer Tools Suite:",
  "Socket & Protocol Tester:",
  "SOCKS Relay Inspection:",
  "User Administration:",
  "JSON-Driven:",
  "Modern Stack:",
] as const;

describe("AboutContent", () => {
  test("renders every feature in the animated feature list", () => {
    render(<AboutContent locale="en-US" />);

    const featureRegion = screen.getByRole("region", {
      name: "Key Features",
    });
    const featureItems = within(featureRegion).getAllByRole("listitem");

    expect(featureItems).toHaveLength(7);
    for (const title of featureTitles) {
      expect(within(featureRegion).getByText(title)).toBeDefined();
    }
  });

  test("renders core summary and omits useless heavy sections", () => {
    render(<AboutContent locale="en-US" />);

    expect(screen.getByRole("region", { name: "What is this?" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Key Features" })).toBeDefined();

    // Ensure useless heavy sections are omitted
    expect(
      screen.queryByRole("region", { name: "System Architecture" })
    ).toBeNull();
    expect(screen.queryByRole("region", { name: "Technology" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Our Team" })).toBeNull();
    expect(screen.queryByText("Interactive Simulator Preview")).toBeNull();
  });
});
