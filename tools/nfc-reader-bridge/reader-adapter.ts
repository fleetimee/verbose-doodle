import type { BridgeReaderState } from "./protocol";

export type ReaderStatus = {
  readonly readerState: BridgeReaderState;
  readonly readerName?: string;
  readonly reason?: string;
  readonly action?: string;
};

export type ReaderStatusListener = (status: ReaderStatus) => void;

export interface ReaderAdapter {
  readonly initialStatus: ReaderStatus;
  start(listener: ReaderStatusListener): Promise<void>;
  stop(): Promise<void>;
}

export const pcscUnavailableStatus: ReaderStatus = {
  readerState: "unavailable",
  reason: "PC/SC support is unavailable on this computer.",
  action:
    "Install or start the operating system PC/SC service, then restart the bridge.",
};

const ACR122U_NAME = /acr122u/i;

export class FakeReaderAdapter implements ReaderAdapter {
  readonly initialStatus: ReaderStatus;
  private listener: ReaderStatusListener | null = null;

  constructor(
    initialStatus: ReaderStatus = {
      readerState: "waiting",
      readerName: "ACS ACR122U 00 00",
    }
  ) {
    this.initialStatus = initialStatus;
  }

  start(listener: ReaderStatusListener): Promise<void> {
    this.listener = listener;
    listener(this.initialStatus);
    return Promise.resolve();
  }

  stop(): Promise<void> {
    this.listener = null;
    return Promise.resolve();
  }

  setStatus(status: ReaderStatus): void {
    this.listener?.(status);
  }
}

type PcscReader = {
  readonly name: string;
  readonly state: number;
  readonly SCARD_STATE_PRESENT: number;
  on(
    event: "status" | "error" | "end",
    listener: (...args: never[]) => void
  ): void;
  close(): void;
};

type PcscClient = {
  on(event: "reader" | "error", listener: (...args: never[]) => void): void;
  close(): void;
};

type PcscFactory = () => PcscClient;

type PcscModule = PcscFactory | { readonly default: PcscFactory };

function getFactory(module: PcscModule): PcscFactory {
  return typeof module === "function" ? module : module.default;
}

export class PcscReaderAdapter implements ReaderAdapter {
  readonly initialStatus: ReaderStatus = {
    readerState: "unavailable",
    reason: "No ACS ACR122U reader has been detected.",
    action: "Connect an ACR122U and check that the PC/SC service is running.",
  };
  private client: PcscClient | null = null;
  private listener: ReaderStatusListener | null = null;
  private readonly readers = new Set<PcscReader>();

  async start(listener: ReaderStatusListener): Promise<void> {
    this.listener = listener;
    try {
      const module = (await import("@pokusew/pcsclite")) as PcscModule;
      this.client = getFactory(module)();
      listener(this.initialStatus);
      this.client.on("error", (error: unknown) => {
        listener({
          readerState: "unavailable",
          reason:
            error instanceof Error
              ? error.message
              : "PC/SC reported an unknown error.",
          action: "Check the PC/SC service and reader driver.",
        });
      });
      this.client.on("reader", (reader: unknown) => {
        this.addReader(reader as PcscReader);
      });
    } catch {
      listener(pcscUnavailableStatus);
    }
  }

  stop(): Promise<void> {
    for (const reader of this.readers) {
      reader.close();
    }
    this.readers.clear();
    this.client?.close();
    this.client = null;
    this.listener = null;
    return Promise.resolve();
  }

  private addReader(reader: PcscReader): void {
    this.readers.add(reader);
    if (!ACR122U_NAME.test(reader.name)) {
      this.listener?.({
        readerState: "unavailable",
        readerName: reader.name,
        reason: `Unsupported reader detected: ${reader.name}.`,
        action: "Connect an ACS ACR122U reader.",
      });
      return;
    }

    this.listener?.({
      readerState:
        reader.state & reader.SCARD_STATE_PRESENT ? "detected" : "waiting",
      readerName: reader.name,
    });
    reader.on("status", (...args: never[]) => {
      const status = args[0] as { readonly state: number } | undefined;
      const present = Boolean(status?.state & reader.SCARD_STATE_PRESENT);
      this.listener?.({
        readerState: present ? "detected" : "waiting",
        readerName: reader.name,
        ...(present
          ? {}
          : { reason: "The ACR122U is ready and waiting for a tag." }),
      });
    });
    reader.on("error", (...args: never[]) => {
      const error = args[0];
      this.listener?.({
        readerState: "unavailable",
        readerName: reader.name,
        reason:
          error instanceof Error
            ? error.message
            : "The ACR122U reported an error.",
        action: "Reconnect the reader and restart the PC/SC service if needed.",
      });
    });
    reader.on("end", () => {
      this.readers.delete(reader);
      this.listener?.({
        readerState: "unavailable",
        readerName: reader.name,
        reason: "The ACR122U reader was removed.",
        action: "Reconnect the reader, then retry.",
      });
    });
  }
}

export function createSystemReaderAdapter(): Promise<ReaderAdapter> {
  return Promise.resolve(new PcscReaderAdapter());
}
