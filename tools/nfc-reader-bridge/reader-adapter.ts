import {
  extractNdefMessage,
  type NdefScanResult,
  parseNdefMessage,
} from "./ndef";
import type { BridgeReaderState } from "./protocol";

export type ReaderStatus = {
  readonly readerState: BridgeReaderState;
  readonly readerName?: string;
  readonly reason?: string;
  readonly action?: string;
};

export type ReaderStatusListener = (status: ReaderStatus) => void;
export type ReaderScanListener = (scan: NdefScanResult) => void;

export interface ReaderAdapter {
  readonly initialStatus: ReaderStatus;
  start(
    listener: ReaderStatusListener,
    scanListener?: ReaderScanListener
  ): Promise<void>;
  stop(): Promise<void>;
}

export const pcscUnavailableStatus: ReaderStatus = {
  readerState: "unavailable",
  reason: "PC/SC support is unavailable on this computer.",
  action:
    "Install or start the operating system PC/SC service, then restart the bridge.",
};

const ACS_READER_NAME = /\bacs\b/i;

export function isSupportedReaderName(readerName: string): boolean {
  return ACS_READER_NAME.test(readerName);
}

export class FakeReaderAdapter implements ReaderAdapter {
  readonly initialStatus: ReaderStatus;
  private listener: ReaderStatusListener | null = null;
  private scanListener: ReaderScanListener | null = null;

  constructor(
    initialStatus: ReaderStatus = {
      readerState: "waiting",
      readerName: "ACS ACR122U 00 00",
    }
  ) {
    this.initialStatus = initialStatus;
  }

  start(
    listener: ReaderStatusListener,
    scanListener?: ReaderScanListener
  ): Promise<void> {
    this.listener = listener;
    this.scanListener = scanListener ?? null;
    listener(this.initialStatus);
    return Promise.resolve();
  }

  stop(): Promise<void> {
    this.listener = null;
    this.scanListener = null;
    return Promise.resolve();
  }

  setStatus(status: ReaderStatus): void {
    this.listener?.(status);
  }

  setScan(scan: NdefScanResult): void {
    this.scanListener?.(scan);
  }
}

type PcscReader = {
  readonly name: string;
  readonly state: number;
  readonly SCARD_STATE_PRESENT: number;
  readonly SCARD_LEAVE_CARD: number;
  readonly SCARD_SHARE_SHARED: number;
  on(
    event: "status" | "error" | "end",
    listener: (...args: never[]) => void
  ): void;
  connect(
    options: { readonly share_mode: number },
    callback: (error: Error | null, protocol: number) => void
  ): void;
  disconnect(
    disposition: number,
    callback: (error: Error | null) => void
  ): void;
  transmit(
    input: Buffer,
    responseLength: number,
    protocol: number,
    callback: (error: Error | null, output: Buffer) => void
  ): void;
  close(): void;
};

type PcscWorkerMessage =
  | { readonly type: "ready" }
  | { readonly type: "pcsc-error"; readonly message: string }
  | {
      readonly type: "reader" | "reader-status";
      readonly name: string;
      readonly present: boolean;
    }
  | { readonly type: "reader-end"; readonly name: string }
  | {
      readonly type: "reader-error";
      readonly name: string;
      readonly message: string;
    }
  | {
      readonly type: "scan";
      readonly name: string;
      readonly rawNdef: string;
      readonly uid: string;
    };

const PCSC_HELPER_PATH = `${import.meta.dir}/pcsc-node-helper.cjs`;
const HEX_PATTERN = /^[0-9a-f]*$/i;

async function resolvePcscHelperPath(): Promise<string> {
  const configuredPath = process.env.NFC_BRIDGE_PCSC_HELPER;
  const candidates = [
    ...(configuredPath ? [configuredPath] : []),
    PCSC_HELPER_PATH,
    `${process.cwd()}/tools/nfc-reader-bridge/pcsc-node-helper.cjs`,
    `${process.cwd()}/pcsc-node-helper.cjs`,
  ];
  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists()) {
      return candidate;
    }
  }
  throw new Error(
    "The PC/SC worker script was not found. Set NFC_BRIDGE_PCSC_HELPER to its path."
  );
}

export class PcscReaderAdapter implements ReaderAdapter {
  readonly initialStatus: ReaderStatus = {
    readerState: "unavailable",
    reason: "No ACS reader has been detected.",
    action:
      "Connect an ACS reader and check that the PC/SC service is running.",
  };
  private listener: ReaderStatusListener | null = null;
  private scanListener: ReaderScanListener | null = null;
  private process: ReturnType<typeof Bun.spawn> | null = null;
  private readonly supportedReaders = new Set<string>();

  async start(
    listener: ReaderStatusListener,
    scanListener?: ReaderScanListener
  ): Promise<void> {
    this.listener = listener;
    this.scanListener = scanListener ?? null;
    listener(this.initialStatus);
    try {
      const helperPath = await resolvePcscHelperPath();
      const process = Bun.spawn(["node", helperPath], {
        stderr: "pipe",
        stdout: "pipe",
      });
      this.process = process;
      if (!process.stdout) {
        throw new Error("The PC/SC worker did not expose stdout.");
      }
      this.consumeWorkerOutput(process.stdout).catch(() => undefined);
      process.exited.then((exitCode) => {
        if (this.process === process && exitCode !== 0) {
          this.listener?.(pcscUnavailableStatus);
        }
      });
    } catch (error) {
      listener({
        ...pcscUnavailableStatus,
        reason:
          error instanceof Error
            ? `PC/SC support is unavailable: ${error.message}`
            : pcscUnavailableStatus.reason,
      });
    }
    return Promise.resolve();
  }

  async stop(): Promise<void> {
    const process = this.process;
    this.process = null;
    process?.kill();
    if (process) {
      await process.exited;
    }
    this.supportedReaders.clear();
    this.listener = null;
    this.scanListener = null;
  }

  private async consumeWorkerOutput(
    output: ReadableStream<Uint8Array>
  ): Promise<void> {
    const reader = output.getReader();
    const decoder = new TextDecoder();
    let pending = "";
    while (true) {
      const result = await reader.read();
      if (result.done) {
        return;
      }
      pending += decoder.decode(result.value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) {
        this.handleWorkerMessage(line);
      }
    }
  }

  private handleWorkerMessage(raw: string): void {
    let message: PcscWorkerMessage;
    try {
      message = JSON.parse(raw) as PcscWorkerMessage;
    } catch {
      return;
    }

    if (message.type === "ready") {
      this.listener?.(this.initialStatus);
      return;
    }
    if (message.type === "pcsc-error") {
      this.listener?.({
        readerState: "unavailable",
        reason: message.message,
        action: "Check the PC/SC service and reader driver.",
      });
      return;
    }
    if (message.type === "reader" || message.type === "reader-status") {
      if (!isSupportedReaderName(message.name)) {
        this.listener?.({
          readerState: "unavailable",
          readerName: message.name,
          reason: `Unsupported reader detected: ${message.name}.`,
          action: "Connect an ACS PC/SC reader.",
        });
        return;
      }
      this.supportedReaders.add(message.name);
      this.listener?.({
        readerState: message.present ? "detected" : "waiting",
        readerName: message.name,
        ...(message.present
          ? {}
          : { reason: "The ACS reader is ready and waiting for a tag." }),
      });
      return;
    }
    if (message.type === "reader-end") {
      this.supportedReaders.delete(message.name);
      this.listener?.({
        readerState: "unavailable",
        readerName: message.name,
        reason: "The ACS reader was removed.",
        action: "Reconnect the reader, then retry.",
      });
      return;
    }
    if (message.type === "reader-error") {
      this.listener?.({
        readerState: "detected",
        readerName: message.name,
        reason: message.message,
        action: "Reconnect the reader and restart the PC/SC service if needed.",
      });
      return;
    }
    if (message.type === "scan" && this.supportedReaders.has(message.name)) {
      this.scanListener?.(
        parseNdefMessage(hexToBytes(message.rawNdef), {
          uid: hexToBytes(message.uid),
        })
      );
    }
  }
}

function hexToBytes(value: string): Uint8Array {
  const normalized = value.replaceAll(" ", "");
  if (normalized.length % 2 !== 0 || !HEX_PATTERN.test(normalized)) {
    throw new Error("The PC/SC worker returned invalid hexadecimal data.");
  }
  return Uint8Array.from(normalized.match(/../g) ?? [], (pair) =>
    Number.parseInt(pair, 16)
  );
}

function transmit(
  reader: PcscReader,
  command: readonly number[],
  protocol: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    reader.transmit(Buffer.from(command), 260, protocol, (error, output) => {
      if (error) {
        reject(error);
        return;
      }
      if (
        output.length < 2 ||
        output.at(-2) !== 0x90 ||
        output.at(-1) !== 0x00
      ) {
        reject(
          new Error(
            `The reader rejected APDU ${command.map((byte) => byte.toString(16).padStart(2, "0")).join(" ")}.`
          )
        );
        return;
      }
      resolve(output.slice(0, -2));
    });
  });
}

function connectReader(reader: PcscReader): Promise<number> {
  return new Promise((resolve, reject) => {
    reader.connect(
      { share_mode: reader.SCARD_SHARE_SHARED },
      (error, protocol) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(protocol);
      }
    );
  });
}

function disconnectReader(reader: PcscReader): Promise<void> {
  return new Promise((resolve) => {
    reader.disconnect(reader.SCARD_LEAVE_CARD, () => resolve());
  });
}

async function readType2Ndef(
  reader: PcscReader,
  protocol: number
): Promise<Uint8Array> {
  const memory: number[] = [];
  for (let page = 4; page < 0x80; page += 4) {
    const chunk = await transmit(
      reader,
      [0xff, 0xb0, 0x00, page, 0x10],
      protocol
    );
    memory.push(...chunk);
    const ndef = extractNdefMessage(Uint8Array.from(memory));
    if (ndef) {
      return ndef;
    }
  }
  throw new Error("No complete Type 2 NDEF message was found.");
}

async function readType4Ndef(
  reader: PcscReader,
  protocol: number
): Promise<Uint8Array> {
  await transmit(
    reader,
    [0x00, 0xa4, 0x04, 0x00, 0x07, 0xd2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x01],
    protocol
  );
  await transmit(reader, [0x00, 0xa4, 0x00, 0x0c, 0x02, 0xe1, 0x04], protocol);
  const lengthBytes = await transmit(
    reader,
    [0x00, 0xb0, 0x00, 0x00, 0x02],
    protocol
  );
  if (lengthBytes.length !== 2) {
    throw new Error("The Type 4 NDEF length response was invalid.");
  }
  const length = (lengthBytes[0] << 8) | lengthBytes[1];
  if (length === 0) {
    throw new Error("The Type 4 tag contains an empty NDEF message.");
  }
  const message: number[] = [];
  for (let offset = 2; offset < length + 2; offset += 0xff) {
    const chunkLength = Math.min(0xff, length + 2 - offset);
    const chunk = await transmit(
      reader,
      [0x00, 0xb0, (offset >> 8) & 0xff, offset & 0xff, chunkLength],
      protocol
    );
    message.push(...chunk);
  }
  return Uint8Array.from(message);
}

export async function readNdefScan(
  reader: PcscReader
): Promise<NdefScanResult> {
  const protocol = await connectReader(reader);
  try {
    const uid = await transmit(
      reader,
      [0xff, 0xca, 0x00, 0x00, 0x00],
      protocol
    );
    let ndef: Uint8Array;
    try {
      ndef = await readType2Ndef(reader, protocol);
    } catch {
      ndef = await readType4Ndef(reader, protocol);
    }
    return parseNdefMessage(ndef, { uid });
  } finally {
    await disconnectReader(reader);
  }
}

export function createSystemReaderAdapter(): Promise<ReaderAdapter> {
  return Promise.resolve(new PcscReaderAdapter());
}
