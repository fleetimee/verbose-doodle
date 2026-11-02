export function saveVolumeDownload(bytes: BlobPart, name: string) {
  const url = URL.createObjectURL(
    new Blob([bytes], { type: "application/octet-stream" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function prepareVolumeDownload(
  names: string[],
  readFile: (name: string, index: number) => Promise<Uint8Array<ArrayBuffer>>,
  tooLargeMessage: string
): Promise<{ bytes: Uint8Array<ArrayBuffer>; name: string }> {
  const contents: [string, Uint8Array<ArrayBuffer>][] = [];
  const archiveNames = new Set<string>();
  let total = 0;
  for (const [index, fileName] of names.entries()) {
    const bytes = await readFile(fileName, index);
    total += bytes.byteLength;
    if (total > 25 * 1024 * 1024) {
      throw new Error(tooLargeMessage);
    }
    const safeName = fileName.replaceAll("\\", "_");
    let name = safeName;
    while (archiveNames.has(name)) {
      name = `${index + 1}-${name}`;
    }
    archiveNames.add(name);
    contents.push([name, bytes]);
  }
  if (names.length === 1) {
    return { bytes: contents[0][1], name: names[0] };
  }
  const { Zip, ZipPassThrough } = await import("fflate");
  const bytes = await new Promise<Uint8Array<ArrayBuffer>>(
    (resolve, reject) => {
      const chunks: Uint8Array[] = [];
      const archive = new Zip((failure, chunk, final) => {
        if (failure) {
          reject(failure);
          return;
        }
        chunks.push(chunk);
        if (final) {
          const output = new Uint8Array(
            chunks.reduce((size, part) => size + part.byteLength, 0)
          );
          let offset = 0;
          for (const part of chunks) {
            output.set(part, offset);
            offset += part.byteLength;
          }
          resolve(output);
        }
      });
      for (const [name, content] of contents) {
        const entry = new ZipPassThrough(name);
        archive.add(entry);
        entry.push(content, true);
      }
      archive.end();
    }
  );
  return { bytes, name: "volume-files.zip" };
}
