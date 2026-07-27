import { describe, expect, test } from "bun:test";
import {
  findReleaseTarget,
  getCurrentBunTarget,
  getReleaseArtifactPath,
  NFC_BRIDGE_RELEASE_TARGETS,
  parseReleaseFlag,
} from "./release";

describe("NFC bridge release packaging", () => {
  test("defines the four supported standalone targets", () => {
    expect(
      NFC_BRIDGE_RELEASE_TARGETS.map(({ bunTarget }) => bunTarget)
    ).toEqual([
      "bun-windows-x64",
      "bun-darwin-x64",
      "bun-darwin-arm64",
      "bun-linux-x64",
    ]);
  });

  test("resolves target names and deterministic artifact paths", () => {
    const target = findReleaseTarget("bun-darwin-arm64");
    if (!target) {
      throw new Error("Expected macOS arm64 to be a supported release target.");
    }
    expect(target?.platform).toBe("macOS arm64");
    expect(findReleaseTarget("nfc-reader-bridge-linux-x64")?.bunTarget).toBe(
      "bun-linux-x64"
    );
    expect(getReleaseArtifactPath("dist/releases", target)).toBe(
      "dist/releases/nfc-reader-bridge-macos-arm64"
    );
    expect(findReleaseTarget("not-a-target")).toBeNull();
  });

  test("identifies the host target and reads release flags", () => {
    expect(getCurrentBunTarget()?.bunTarget).toBe("bun-darwin-arm64");
    expect(parseReleaseFlag(["--target", "bun-linux-x64"], "--target")).toBe(
      "bun-linux-x64"
    );
    expect(parseReleaseFlag([], "--outdir")).toBeUndefined();
  });
});
