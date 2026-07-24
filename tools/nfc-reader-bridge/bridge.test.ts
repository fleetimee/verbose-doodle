import { afterEach, describe, expect, test } from "bun:test";
import {
  assertLoopbackHost,
  NfcBridge,
  normalizeBridgeConfig,
  validateBridgeHandshake,
} from "./bridge";
import { FakeReaderAdapter } from "./reader-adapter";

const bridges: NfcBridge[] = [];

afterEach(async () => {
  for (const bridge of bridges.splice(0)) {
    await bridge.stop();
  }
});

describe("NFC bridge lifecycle", () => {
  test("rejects network binding and missing token configuration", () => {
    expect(() => assertLoopbackHost("192.168.1.20")).toThrow("loopback");
    expect(
      () =>
        new NfcBridge({
          allowedOrigins: ["http://localhost:5173"],
          token: "",
        })
    ).toThrow("NFC_BRIDGE_TOKEN");
  });

  test("requires an allowed origin and the configured session token", () => {
    const config = normalizeBridgeConfig({
      allowedOrigins: ["http://localhost:5173"],
      token: "secret",
    });
    expect(
      validateBridgeHandshake(config, "https://untrusted.example", "secret")
    ).toEqual({
      code: "origin-rejected",
      ok: false,
      status: 403,
    });
    expect(
      validateBridgeHandshake(config, "http://localhost:5173", "wrong")
    ).toEqual({
      code: "unauthorized",
      ok: false,
      status: 401,
    });
    expect(
      validateBridgeHandshake(config, "http://localhost:5173", "secret")
    ).toEqual({
      ok: true,
    });
  });

  test("starts on loopback and reports health", async () => {
    const bridge = new NfcBridge(
      {
        allowedOrigins: ["http://localhost:5173"],
        port: 0,
        token: "secret",
      },
      new FakeReaderAdapter()
    );
    bridges.push(bridge);
    await bridge.start();

    const port = bridge.getPort();
    expect(port).toBeGreaterThan(0);
    expect(bridge.getHealthResponse().status).toBe(200);
    expect(await bridge.getHealthResponse().json()).toMatchObject({
      protocolVersion: "1",
      status: "ok",
      bridge: {
        host: "127.0.0.1",
        tokenRequired: true,
      },
      reader: {
        readerState: "waiting",
      },
    });
  });
});
