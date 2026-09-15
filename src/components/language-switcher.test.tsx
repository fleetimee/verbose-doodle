import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/components/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getActiveLocale } from "@/lib/i18n";

describe("LanguageSwitcher", () => {
  test("toggles language between English and Indonesian immediately", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider defaultLocale="en-US">
        <LanguageSwitcher />
      </I18nProvider>
    );

    const indonesianButton = await screen.findByRole("button", {
      name: "Bahasa Indonesia",
    });
    expect(indonesianButton).toBeDefined();

    await user.click(indonesianButton);

    expect(getActiveLocale()).toBe("id-ID");
    expect(document.documentElement.lang).toBe("id-ID");

    const englishButton = await screen.findByRole("button", {
      name: "Bahasa Inggris",
    });
    await user.click(englishButton);

    expect(getActiveLocale()).toBe("en-US");
    expect(document.documentElement.lang).toBe("en-US");
  });
});
