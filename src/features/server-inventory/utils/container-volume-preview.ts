function rawVolumeText(bytes: Uint8Array): string {
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    chunks.push(
      Array.from(bytes.subarray(offset, offset + 8192), (byte) => {
        if (byte === 92) {
          return "\\\\";
        }
        if (
          byte === 9 ||
          byte === 10 ||
          byte === 13 ||
          (byte >= 32 && byte <= 126)
        ) {
          return String.fromCharCode(byte);
        }
        return `\\x${byte.toString(16).padStart(2, "0")}`;
      }).join("")
    );
  }
  return chunks.join("");
}

export function decodeVolumeText(bytes: Uint8Array) {
  let encoding = "utf-8";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    encoding = "utf-16le";
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    encoding = "utf-16be";
  }
  try {
    const text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
    if (!text.includes("\0")) {
      return { text, raw: false };
    }
  } catch {
    return { text: rawVolumeText(bytes), raw: true };
  }
  return { text: rawVolumeText(bytes), raw: true };
}

export function containerVolumePreviewUrl(
  serverId: string,
  containerId: string,
  mount: string,
  path: string
): string {
  const query = new URLSearchParams({ mount, path });
  return `/servers/${encodeURIComponent(serverId)}/containers/${encodeURIComponent(containerId)}/preview?${query}`;
}
