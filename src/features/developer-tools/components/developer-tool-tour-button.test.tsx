import { describe, expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { DeveloperToolTourButton } from "@/features/developer-tools/components/developer-tool-tour-button";

const STORAGE_KEY = "developer-tool-tour-test-seen";

describe("DeveloperToolTourButton", () => {
  test("starts once automatically, stores completion, and supports replay", async () => {
    const user = userEvent.setup();
    localStorage.removeItem(STORAGE_KEY);
    render(
      <TourProvider closeable>
        <div id="developer-tool-tour-test-target">Target</div>
        <DeveloperToolTourButton
          label="Start tour"
          steps={[
            {
              description: "A short explanation.",
              selectorId: "developer-tool-tour-test-target",
              title: "Tour started",
            },
          ]}
          storageKey={STORAGE_KEY}
          tourId="developer-tool-tour-test"
        />
      </TourProvider>
    );

    expect(await screen.findByText("Tour started")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Finish" }));
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBe("true"));

    await user.click(screen.getByRole("button", { name: "Start tour" }));
    expect(await screen.findByText("Tour started")).toBeDefined();
  });
});
