import { describe, expect, test } from "bun:test";
import {
  formatNfcBridgeUsage,
  formatNfcBridgeVersion,
  parseNfcBridgeCliCommand,
} from "./cli";

describe("NFC bridge CLI", () => {
  test("parses lifecycle and help aliases", () => {
    expect(parseNfcBridgeCliCommand([])).toBe("status");
    expect(parseNfcBridgeCliCommand(["start"])).toBe("start");
    expect(parseNfcBridgeCliCommand(["status"])).toBe("status");
    expect(parseNfcBridgeCliCommand(["stop"])).toBe("stop");
    expect(parseNfcBridgeCliCommand(["--help"])).toBe("help");
    expect(parseNfcBridgeCliCommand(["-v"])).toBe("version");
    expect(() => parseNfcBridgeCliCommand(["restart"])).toThrow("Usage:");
  });

  test("reports the bridge and protocol versions", () => {
    expect(formatNfcBridgeVersion()).toContain("NFC Reader Bridge 0.1.0");
    expect(formatNfcBridgeVersion()).toContain("Bridge protocol version 1");
    expect(formatNfcBridgeUsage()).toContain("start");
    expect(formatNfcBridgeUsage()).toContain("status");
    expect(formatNfcBridgeUsage()).toContain("stop");
  });
});
