import {
  createDefaultNfcBridge,
  DEFAULT_NFC_BRIDGE_HOST,
  DEFAULT_NFC_BRIDGE_PORT,
  DEFAULT_NFC_BRIDGE_VERSION,
} from "./bridge";
import { NFC_BRIDGE_PROTOCOL_VERSION } from "./protocol";

export type NfcBridgeCliCommand =
  | "help"
  | "start"
  | "status"
  | "stop"
  | "version";

export function parseNfcBridgeCliCommand(
  args: readonly string[]
): NfcBridgeCliCommand {
  const command = args[0] ?? "status";
  if (command === "help" || command === "--help" || command === "-h") {
    return "help";
  }
  if (command === "version" || command === "--version" || command === "-v") {
    return "version";
  }
  if (command === "start" || command === "status" || command === "stop") {
    return command;
  }
  throw new Error(formatNfcBridgeUsage());
}

export function formatNfcBridgeVersion(): string {
  return [
    `NFC Reader Bridge ${DEFAULT_NFC_BRIDGE_VERSION}`,
    `Bridge protocol version ${NFC_BRIDGE_PROTOCOL_VERSION}`,
  ].join("\n");
}

export function formatNfcBridgeUsage(): string {
  return [
    "Usage: nfc-reader-bridge <start|status|stop|version>",
    "",
    "Commands:",
    "  start    Start the local WebSocket bridge",
    "  status   Show bridge and reader health",
    "  stop     Stop the local bridge process",
    "  version  Show bridge and protocol versions",
  ].join("\n");
}

function getConfig() {
  const port = Number(process.env.NFC_BRIDGE_PORT ?? DEFAULT_NFC_BRIDGE_PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("NFC_BRIDGE_PORT must be an integer from 0 through 65535.");
  }
  return {
    allowedOrigins: (
      process.env.NFC_BRIDGE_ALLOWED_ORIGINS ?? "http://localhost:5173"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    host: process.env.NFC_BRIDGE_HOST ?? DEFAULT_NFC_BRIDGE_HOST,
    pidFile: process.env.NFC_BRIDGE_PID_FILE ?? getDefaultPidFile(),
    port,
    readyFile: process.env.NFC_BRIDGE_READY_FILE,
    token: process.env.NFC_BRIDGE_TOKEN ?? "",
  };
}

function getDefaultPidFile(): string {
  if (process.platform === "win32") {
    const directory = process.env.LOCALAPPDATA ?? process.env.TEMP ?? ".";
    return `${directory}/biller-simulator-nfc-bridge.pid`;
  }
  return "/tmp/biller-simulator-nfc-bridge.pid";
}

async function readHealth(): Promise<void> {
  const { host, port } = getConfig();
  try {
    const response = await fetch(`http://${host}:${port}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  } catch (error) {
    const reason = error instanceof Error ? `: ${error.message}` : "";
    process.stdout.write(
      `NFC bridge is unavailable${reason}. Start it with nfc-reader-bridge start.\n`
    );
    process.exitCode = 1;
  }
}

async function stopBridge(): Promise<void> {
  const { pidFile } = getConfig();
  try {
    const pid = Number(await Bun.file(pidFile).text());
    if (Number.isInteger(pid) && pid > 0) {
      process.kill(pid, "SIGTERM");
      await Bun.write(pidFile, "");
      process.stdout.write(`Stopped NFC bridge process ${pid}.\n`);
      return;
    }
  } catch {
    // The process is already stopped or never started.
  }
  process.stdout.write("NFC bridge is not running.\n");
}

async function startBridge(): Promise<void> {
  const { allowedOrigins, host, pidFile, port, readyFile, token } = getConfig();
  if (!token) {
    throw new Error("Set NFC_BRIDGE_TOKEN before starting the NFC bridge.");
  }
  const bridge = await createDefaultNfcBridge({
    allowedOrigins,
    host,
    port,
    token,
  });
  await Bun.write(pidFile, String(process.pid));
  const shutdown = async () => {
    await bridge.stop();
    await Bun.write(pidFile, "");
    if (readyFile) {
      await Bun.write(readyFile, "");
    }
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  await bridge.start();
  if (readyFile) {
    await Bun.write(
      readyFile,
      JSON.stringify({
        bridgeVersion: DEFAULT_NFC_BRIDGE_VERSION,
        host,
        pid: process.pid,
        port: bridge.getPort(),
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      })
    );
  }
  process.stdout.write(
    `NFC bridge listening on ws://${host}:${bridge.getPort() ?? port}/ws (health: http://${host}:${bridge.getPort() ?? port}/health).\n`
  );
}

export async function runNfcBridgeCli(
  args: readonly string[] = process.argv.slice(2)
): Promise<void> {
  const command = parseNfcBridgeCliCommand(args);
  if (command === "help") {
    process.stdout.write(`${formatNfcBridgeUsage()}\n`);
    return;
  }
  if (command === "version") {
    process.stdout.write(`${formatNfcBridgeVersion()}\n`);
    return;
  }
  if (command === "start") {
    await startBridge();
    return;
  }
  if (command === "stop") {
    await stopBridge();
    return;
  }
  await readHealth();
}

if (import.meta.main) {
  try {
    await runNfcBridgeCli();
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : "NFC bridge command failed."}\n`
    );
    process.exitCode = 1;
  }
}
