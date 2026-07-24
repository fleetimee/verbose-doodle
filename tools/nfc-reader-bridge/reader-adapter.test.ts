import { describe, expect, test } from "bun:test";
import { FakeReaderAdapter, pcscUnavailableStatus } from "./reader-adapter";

describe("NFC reader adapter seam", () => {
  test("emits deterministic waiting and reader-unavailable states", async () => {
    const waiting = new FakeReaderAdapter();
    const states: string[] = [];
    await waiting.start((status) => states.push(status.readerState));
    expect(states).toEqual(["waiting"]);

    const unavailable = new FakeReaderAdapter(pcscUnavailableStatus);
    await unavailable.start((status) => states.push(status.readerState));
    expect(states.at(-1)).toBe("unavailable");
  });

  test("can drive detected and waiting transitions without hardware", async () => {
    const adapter = new FakeReaderAdapter();
    const states: string[] = [];
    await adapter.start((status) => states.push(status.readerState));
    adapter.setStatus({
      readerState: "detected",
      readerName: "ACS ACR122U 00 00",
    });
    adapter.setStatus({
      readerState: "waiting",
      readerName: "ACS ACR122U 00 00",
      reason: "The ACR122U is ready and waiting for a tag.",
    });
    expect(states).toEqual(["waiting", "detected", "waiting"]);
  });
});
