import { describe, expect, test } from "bun:test";
import { getActiveLocale, getMessages, setActiveLocale } from "./i18n";

describe("i18n multilingual support", () => {
  test("returns default en-US messages", () => {
    const messages = getMessages("en-US");
    expect(messages.about.headerTitle).toBe("About This Project");
    expect(messages.about.whatIsThisTitle).toBe("What is this?");
  });

  test("returns id-ID Indonesian translation messages for About page", () => {
    const messages = getMessages("id-ID");
    expect(messages.about.headerTitle).toBe("Tentang Proyek Ini");
    expect(messages.about.whatIsThisTitle).toBe("Apa ini?");
    expect(messages.about.keyFeaturesTitle).toBe("Fitur Utama");
  });

  test("updates active locale state and persists choice", () => {
    setActiveLocale("id-ID");
    expect(getActiveLocale()).toBe("id-ID");
    const messages = getMessages();
    expect(messages.about.ourTeamTitle).toBe("Tim Kami");

    // Reset back to default
    setActiveLocale("en-US");
    expect(getActiveLocale()).toBe("en-US");
  });
});
