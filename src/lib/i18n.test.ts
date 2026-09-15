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

  test("returns id-ID Indonesian translations for newly supported modules", () => {
    const idMessages = getMessages("id-ID");
    expect(idMessages.common.cancel).toBe("Batal");
    expect(idMessages.common.save).toBe("Simpan");
    expect(idMessages.theme.lightTheme).toBe("Tema terang");
    expect(idMessages.theme.darkTheme).toBe("Tema gelap");
    expect(idMessages.auth.lockScreen).toBe("Kunci layar");
    expect(idMessages.auth.signIn).toBe("Masuk");
    expect(idMessages.billers.addBiller).toBe("Tambah Biller");
    expect(idMessages.users.addUser).toBe("Tambah Pengguna");
    expect(idMessages.errors.notFoundTitle).toBe("404");
    expect(idMessages.overview.pageTitle).toBe("Ringkasan");
    expect(idMessages.overview.coverageTitle).toBe("Cakupan simulator");
    expect(idMessages.developerTools.pageTitle).toBe("Developer Tools");
    expect(idMessages.developerTools.navigationGroup).toBe("Developer Tools");
    expect(idMessages.common.navWorkspace).toBe("Workspace");
    expect(idMessages.common.navEndpoints).toBe("Endpoints");
    expect(idMessages.common.navOverview).toBe("Overview");
    expect(idMessages.endpoints.documentTitle).toBe("Endpoints");
    expect(idMessages.endpoints.addEndpoint).toBe("Tambah Endpoint");
    expect(idMessages.socketTester.documentTitle).toBe("Socket Tester");
    expect(idMessages.socksRelay.documentTitle).toBe("SOCKS Relay");
    expect(idMessages.jwtInspector.title).toBe("JWT Inspector");
    expect(idMessages.cronParser.title).toBe("Cron Parser");
    expect(idMessages.dateConverter.title).toBe("Date Converter");
    expect(idMessages.numberBaseConverter.title).toBe("Number Base Converter");
    expect(idMessages.jsonYamlConverter.title).toBe("JSON/YAML Converter");
    expect(idMessages.jsonSchemaValidator.title).toBe("JSON Schema Validator");
    expect(idMessages.iso8583Parser.title).toBe("ISO 8583 Parser");
    expect(idMessages.iso8583Generator.title).toBe("ISO 8583 Generator");
  });

  test("messages proxy reflects the active locale dynamically including nested properties", () => {
    const { messages: proxyMessages } = require("./i18n");
    const copy = proxyMessages.common;

    setActiveLocale("en-US");
    expect(copy.cancel).toBe("Cancel");

    setActiveLocale("id-ID");
    expect(copy.cancel).toBe("Batal");

    // Reset back to en-US
    setActiveLocale("en-US");
    expect(copy.cancel).toBe("Cancel");
  });
});
