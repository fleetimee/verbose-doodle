"use strict";

const pcsclite = require("@pokusew/pcsclite");

const pcsc = pcsclite();
const readers = new Set();
const activeReads = new Set();

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function transmit(reader, command, protocol) {
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
        reject(new Error(`The reader rejected APDU ${toHex(command)}.`));
        return;
      }
      resolve(output.subarray(0, -2));
    });
  });
}

function toHex(bytes) {
  return (
    Buffer.from(bytes).toString("hex").toUpperCase().match(/../g)?.join(" ") ??
    ""
  );
}

function connect(reader) {
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

function disconnect(reader) {
  return new Promise((resolve) => {
    reader.disconnect(reader.SCARD_LEAVE_CARD, () => resolve());
  });
}

function extractNdefMessage(memory) {
  let offset = 0;
  while (offset < memory.length) {
    const type = memory[offset++];
    if (type === 0x00) {
      continue;
    }
    if (type === 0xfe || offset >= memory.length) {
      return null;
    }
    let length = memory[offset++];
    if (length === 0xff) {
      if (memory.length - offset < 2) {
        return null;
      }
      length = (memory[offset] << 8) | memory[offset + 1];
      offset += 2;
    }
    if (memory.length - offset < length) {
      return null;
    }
    if (type === 0x03) {
      return memory.subarray(offset, offset + length);
    }
    offset += length;
  }
  return null;
}

async function readType2Ndef(reader, protocol) {
  const memory = [];
  for (let page = 4; page < 0x80; page += 4) {
    const chunk = await transmit(
      reader,
      [0xff, 0xb0, 0x00, page, 0x10],
      protocol
    );
    memory.push(...chunk);
    const ndef = extractNdefMessage(Buffer.from(memory));
    if (ndef) {
      return ndef;
    }
  }
  throw new Error("No complete Type 2 NDEF message was found.");
}

async function readType4Ndef(reader, protocol) {
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
  const message = [];
  for (let offset = 2; offset < length + 2; offset += 0xff) {
    const chunkLength = Math.min(0xff, length + 2 - offset);
    const chunk = await transmit(
      reader,
      [0x00, 0xb0, (offset >> 8) & 0xff, offset & 0xff, chunkLength],
      protocol
    );
    message.push(...chunk);
  }
  return Buffer.from(message);
}

async function readTag(reader) {
  if (activeReads.has(reader)) {
    return;
  }
  activeReads.add(reader);
  try {
    const protocol = await connect(reader);
    try {
      const uid = await transmit(
        reader,
        [0xff, 0xca, 0x00, 0x00, 0x00],
        protocol
      );
      let ndef;
      try {
        ndef = await readType2Ndef(reader, protocol);
      } catch {
        ndef = await readType4Ndef(reader, protocol);
      }
      send({
        name: reader.name,
        rawNdef: toHex(ndef),
        type: "scan",
        uid: toHex(uid),
      });
    } finally {
      await disconnect(reader);
    }
  } catch (error) {
    send({
      message: error instanceof Error ? error.message : "The NDEF read failed.",
      name: reader.name,
      type: "reader-error",
    });
  } finally {
    activeReads.delete(reader);
  }
}

function reportStatus(reader, state) {
  const present = Boolean(state & reader.SCARD_STATE_PRESENT);
  send({ name: reader.name, present, type: "reader-status" });
  if (present) {
    readTag(reader).catch(() => undefined);
  }
}

pcsc.on("reader", (reader) => {
  readers.add(reader);
  send({
    name: reader.name,
    present: Boolean(reader.state & reader.SCARD_STATE_PRESENT),
    type: "reader",
  });
  reader.on("status", (status) => {
    const changes = reader.state ^ status.state;
    if (changes) {
      reportStatus(reader, status.state);
    }
  });
  reader.on("error", (error) => {
    send({ message: error.message, name: reader.name, type: "reader-error" });
  });
  reader.on("end", () => {
    readers.delete(reader);
    send({ name: reader.name, type: "reader-end" });
  });
  if (reader.state & reader.SCARD_STATE_PRESENT) {
    readTag(reader).catch(() => undefined);
  }
});

pcsc.on("error", (error) => {
  send({ message: error.message, type: "pcsc-error" });
});

process.stdin.on("data", (data) => {
  if (data.toString().trim() === "stop") {
    for (const reader of readers) {
      reader.close();
    }
    pcsc.close();
    process.exit(0);
  }
});

send({ type: "ready" });
