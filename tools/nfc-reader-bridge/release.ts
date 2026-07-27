import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_NFC_BRIDGE_HOST, DEFAULT_NFC_BRIDGE_VERSION } from "./bridge";
import { NFC_BRIDGE_PROTOCOL_VERSION } from "./protocol";

export const NFC_BRIDGE_RELEASE_TARGETS = [
  {
    artifact: "nfc-reader-bridge-windows-x64.exe",
    bunTarget: "bun-windows-x64",
    platform: "Windows x64",
  },
  {
    artifact: "nfc-reader-bridge-macos-x64",
    bunTarget: "bun-darwin-x64",
    platform: "macOS x64",
  },
  {
    artifact: "nfc-reader-bridge-macos-arm64",
    bunTarget: "bun-darwin-arm64",
    platform: "macOS arm64",
  },
  {
    artifact: "nfc-reader-bridge-linux-x64",
    bunTarget: "bun-linux-x64",
    platform: "Linux x64",
  },
] as const;

export type NfcBridgeReleaseTarget =
  (typeof NFC_BRIDGE_RELEASE_TARGETS)[number];

export function getCurrentBunTarget(): NfcBridgeReleaseTarget | null {
  let target: string | null = null;
  if (process.platform === "win32" && process.arch === "x64") {
    target = "bun-windows-x64";
  } else if (process.platform === "darwin" && process.arch === "x64") {
    target = "bun-darwin-x64";
  } else if (process.platform === "darwin" && process.arch === "arm64") {
    target = "bun-darwin-arm64";
  } else if (process.platform === "linux" && process.arch === "x64") {
    target = "bun-linux-x64";
  }
  return (
    NFC_BRIDGE_RELEASE_TARGETS.find(
      (releaseTarget) => releaseTarget.bunTarget === target
    ) ?? null
  );
}

export function findReleaseTarget(
  requestedTarget: string | undefined
): NfcBridgeReleaseTarget | null {
  if (!requestedTarget || requestedTarget === "current") {
    return getCurrentBunTarget();
  }
  return (
    NFC_BRIDGE_RELEASE_TARGETS.find(
      (releaseTarget) =>
        releaseTarget.bunTarget === requestedTarget ||
        releaseTarget.artifact === requestedTarget
    ) ?? null
  );
}

export function getReleaseArtifactPath(
  outputDirectory: string,
  target: NfcBridgeReleaseTarget
): string {
  return join(outputDirectory, target.artifact);
}

export function parseReleaseFlag(
  args: readonly string[],
  flag: string
): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function buildTarget(
  outputDirectory: string,
  target: NfcBridgeReleaseTarget
): Promise<void> {
  const artifactPath = getReleaseArtifactPath(outputDirectory, target);
  process.stdout.write(`Building ${target.platform} -> ${artifactPath}\n`);
  const result = Bun.spawnSync(
    [
      "bun",
      "build",
      "--compile",
      `--target=${target.bunTarget}`,
      `--outfile=${artifactPath}`,
      "tools/nfc-reader-bridge/cli.ts",
    ],
    { stderr: "inherit", stdout: "inherit" }
  );
  if (result.exitCode !== 0) {
    throw new Error(`Failed to build ${target.platform}.`);
  }
}

async function writeManifest(
  outputDirectory: string,
  targets: readonly NfcBridgeReleaseTarget[]
): Promise<void> {
  await Bun.write(
    join(outputDirectory, "release-manifest.json"),
    `${JSON.stringify(
      {
        bridgeVersion: DEFAULT_NFC_BRIDGE_VERSION,
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        targets: targets.map(({ artifact, bunTarget, platform }) => ({
          artifact,
          bunTarget,
          platform,
        })),
      },
      null,
      2
    )}\n`
  );
}

async function copyPcscHelper(outputDirectory: string): Promise<void> {
  const helperPath = "tools/nfc-reader-bridge/pcsc-node-helper.cjs";
  if (!(await Bun.file(helperPath).exists())) {
    throw new Error(`The PC/SC helper is missing: ${helperPath}`);
  }
  await Bun.write(
    join(outputDirectory, "pcsc-node-helper.cjs"),
    await Bun.file(helperPath).arrayBuffer()
  );
}

async function buildRelease(args: readonly string[]): Promise<void> {
  const outputDirectory =
    parseReleaseFlag(args, "--outdir") ?? "dist/nfc-reader-bridge";
  const requestedTarget = parseReleaseFlag(args, "--target");
  const targets = requestedTarget
    ? [findReleaseTarget(requestedTarget)]
    : [...NFC_BRIDGE_RELEASE_TARGETS];
  if (targets.some((target) => !target)) {
    throw new Error(
      `Unsupported release target: ${requestedTarget}. Supported targets: ${NFC_BRIDGE_RELEASE_TARGETS.map(({ bunTarget }) => bunTarget).join(", ")}.`
    );
  }
  const resolvedTargets = targets as NfcBridgeReleaseTarget[];
  await mkdir(outputDirectory, { recursive: true });
  for (const target of resolvedTargets) {
    await buildTarget(outputDirectory, target);
  }
  await copyPcscHelper(outputDirectory);
  await writeManifest(outputDirectory, resolvedTargets);
  process.stdout.write(
    `Release manifest written to ${join(outputDirectory, "release-manifest.json")}\n`
  );
}

async function waitForReadyFile(path: string): Promise<{
  readonly bridgeVersion: string;
  readonly host: string;
  readonly pid: number;
  readonly port: number;
  readonly protocolVersion: string;
}> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await Bun.file(path).exists()) {
      const content = await Bun.file(path).text();
      if (content) {
        return JSON.parse(content) as {
          readonly bridgeVersion: string;
          readonly host: string;
          readonly pid: number;
          readonly port: number;
          readonly protocolVersion: string;
        };
      }
    }
    await Bun.sleep(50);
  }
  throw new Error(
    "The bridge did not report a ready endpoint within 5 seconds."
  );
}

async function smokeTarget(
  outputDirectory: string,
  target: NfcBridgeReleaseTarget
): Promise<void> {
  const artifactPath = getReleaseArtifactPath(outputDirectory, target);
  if (!(await Bun.file(artifactPath).exists())) {
    throw new Error(`Release artifact is missing: ${artifactPath}`);
  }
  const currentTarget = getCurrentBunTarget();
  if (currentTarget?.bunTarget !== target.bunTarget) {
    process.stdout.write(
      `Skipping runtime smoke for ${target.platform}; run it on a native ${target.platform} host.\n`
    );
    return;
  }

  const temporaryDirectory = await mkdtemp(join(tmpdir(), "nfc-bridge-smoke-"));
  const readyFile = join(temporaryDirectory, "ready.json");
  const pidFile = join(temporaryDirectory, "bridge.pid");
  const token = "nfc-bridge-smoke-token";
  const origin = "http://localhost:5173";
  const child = Bun.spawn([artifactPath, "start"], {
    env: {
      ...process.env,
      NFC_BRIDGE_ALLOWED_ORIGINS: origin,
      NFC_BRIDGE_PID_FILE: pidFile,
      NFC_BRIDGE_PORT: "0",
      NFC_BRIDGE_READY_FILE: readyFile,
      NFC_BRIDGE_TOKEN: token,
    },
    stderr: "pipe",
    stdout: "pipe",
  });

  try {
    const ready = await waitForReadyFile(readyFile);
    if (
      ready.bridgeVersion !== DEFAULT_NFC_BRIDGE_VERSION ||
      ready.host !== DEFAULT_NFC_BRIDGE_HOST ||
      ready.protocolVersion !== NFC_BRIDGE_PROTOCOL_VERSION ||
      !Number.isInteger(ready.port) ||
      ready.port <= 0
    ) {
      throw new Error(
        "The bridge ready payload did not report valid release metadata."
      );
    }
    const healthResponse = await fetch(
      `http://${ready.host}:${ready.port}/health`
    );
    const health = (await healthResponse.json()) as {
      readonly bridge?: { readonly host?: string };
      readonly protocolVersion?: string;
      readonly status?: string;
    };
    if (
      !healthResponse.ok ||
      health.status !== "ok" ||
      health.protocolVersion !== NFC_BRIDGE_PROTOCOL_VERSION ||
      health.bridge?.host !== DEFAULT_NFC_BRIDGE_HOST
    ) {
      throw new Error(
        "The bridge health endpoint failed the release smoke check."
      );
    }
    await smokeWebSocket(ready.port, origin, token);
    process.stdout.write(`Smoke passed for ${target.platform}.\n`);
  } finally {
    child.kill();
    await child.exited;
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}

async function smokeWebSocket(
  port: number,
  origin: string,
  token: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(
      `ws://${DEFAULT_NFC_BRIDGE_HOST}:${port}/ws?token=${token}`,
      { headers: { Origin: origin } }
    );
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error("The bridge WebSocket endpoint did not open in time."));
    }, 3000);
    socket.onerror = () => {
      clearTimeout(timeout);
      reject(
        new Error("The bridge WebSocket endpoint rejected the smoke check.")
      );
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as {
        readonly protocolVersion?: string;
        readonly type?: string;
      };
      if (
        message.type === "bridge-status" &&
        message.protocolVersion === NFC_BRIDGE_PROTOCOL_VERSION
      ) {
        clearTimeout(timeout);
        socket.close();
        resolve();
      }
    };
  });
}

async function smokeRelease(args: readonly string[]): Promise<void> {
  const outputDirectory =
    parseReleaseFlag(args, "--outdir") ?? "dist/nfc-reader-bridge";
  const requestedTarget = parseReleaseFlag(args, "--target");
  const target = requestedTarget
    ? findReleaseTarget(requestedTarget)
    : getCurrentBunTarget();
  if (!target) {
    throw new Error(
      "A native release target is required for smoke tests. Use --target on a supported host."
    );
  }
  await smokeTarget(outputDirectory, target);
}

export async function runReleaseCommand(
  args: readonly string[] = process.argv.slice(2)
): Promise<void> {
  const command = args[0] ?? "help";
  if (command === "build") {
    await buildRelease(args.slice(1));
    return;
  }
  if (command === "smoke") {
    await smokeRelease(args.slice(1));
    return;
  }
  process.stdout.write(
    "Usage: bun tools/nfc-reader-bridge/release.ts <build|smoke> [--target TARGET] [--outdir DIRECTORY]\n"
  );
}

if (import.meta.main) {
  try {
    await runReleaseCommand();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "NFC bridge release command failed."}\n`
    );
    process.exitCode = 1;
  }
}
