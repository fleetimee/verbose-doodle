import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MacOsLogin } from "@/features/login/components/macos-login";

describe("MacOsLogin", () => {
  test("renders the animated password state accessibly", () => {
    const { container } = render(
      <MacOsLogin
        isComplete={false}
        onTransitionComplete={() => undefined}
        progress={42}
      />
    );

    expect(screen.getByText("Fleetime Labs")).toBeDefined();
    expect(screen.getByLabelText("Validating demo credentials")).toBeDefined();
    expect(
      screen.getByText("Creating a secure simulator session")
    ).toBeDefined();
    expect(container.querySelectorAll(".macos-password-dot")).toHaveLength(11);
    expect(
      container.querySelector(".macos-lock-mascot")?.getAttribute("src")
    ).toBe("/brand/biller-operator-mascot-lockscreen.webp");
    expect(container.querySelectorAll(".macos-glass-break span")).toHaveLength(
      8
    );
    expect(
      container.querySelector(".macos-lock-screen")?.getAttribute("data-state")
    ).toBe("loading");
  });

  test("announces when the session is ready", () => {
    const { container } = render(
      <MacOsLogin
        isComplete={true}
        onTransitionComplete={() => undefined}
        progress={100}
      />
    );

    expect(screen.getByText("Session ready. Redirecting...")).toBeDefined();
    expect(
      container.querySelector(".macos-lock-screen")?.getAttribute("data-state")
    ).toBe("loading");
  });
});
