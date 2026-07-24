import {
  createDefaultNfcBridge,
  DEFAULT_NFC_BRIDGE_HOST,
  DEFAULT_NFC_BRIDGE_PORT,
} from "./bridge";

const pidFile =
  process.env.NFC_BRIDGE_PID_FILE ?? "/tmp/biller-simulator-nfc-bridge.pid";
const port = Number(process.env.NFC_BRIDGE_PORT ?? DEFAULT_NFC_BRIDGE_PORT);
const host = process.env.NFC_BRIDGE_HOST ?? DEFAULT_NFC_BRIDGE_HOST;
const token = process.env.NFC_BRIDGE_TOKEN ?? "";
const allowedOrigins = (
  process.env.NFC_BRIDGE_ALLOWED_ORIGINS ?? "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

async function readHealth(): Promise<void> {
  try {
    const response = await fetch(`http://${host}:${port}/health`);
    const body = (await response.json()) as Record<string, unknown>;
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
  } catch {
    process.stdout.write(
      "NFC bridge is unavailable. Start it with `bun run nfc-bridge start`.\n"
    );
    process.exitCode = 1;
  }
}

async function stopBridge(): Promise<void> {
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
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  await bridge.start();
  process.stdout.write(
    `NFC bridge listening on ws://${host}:${port}/ws (health: http://${host}:${port}/health).\n`
  );
}

const command = process.argv[2] ?? "status";
if (command === "start") {
  await startBridge();
} else if (command === "stop") {
  await stopBridge();
} else if (command === "status") {
  await readHealth();
} else {
  throw new Error("Usage: bun run nfc-bridge <start|status|stop>");
}
