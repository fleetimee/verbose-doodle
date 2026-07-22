import { describe, expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("shows a team member tooltip on hover", async () => {
    const user = userEvent.setup();
    render(<AboutContent locale="en-US" />);

    await user.hover(
      screen.getByRole("button", {
        name: "View profile for Nashira Oksani Ardine Santosa",
      })
    );

    expect(
      screen.getByText("Technical Writer & Frontend Developer")
    ).toBeDefined();
  });
});
