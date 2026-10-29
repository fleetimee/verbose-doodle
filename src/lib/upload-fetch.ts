import type { ApiFetchImplementation } from "@/lib/api";

const RESPONSE_HEADER_LINES = /[\r\n]+/;

export function createUploadFetch(
  onProgress: (percent: number) => void
): ApiFetchImplementation {
  return (input, options = {}) =>
    new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const abort = () => xhr.abort();
      xhr.open(options.method ?? "POST", String(input));
      new Headers(options.headers).forEach((value, name) => {
        xhr.setRequestHeader(name, value);
      });
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        const headers = new Headers();
        for (const line of xhr
          .getAllResponseHeaders()
          .trim()
          .split(RESPONSE_HEADER_LINES)) {
          const colon = line.indexOf(":");
          if (colon > 0) {
            headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
          }
        }
        resolve(
          new Response(xhr.status === 204 ? null : xhr.responseText, {
            headers,
            status: xhr.status,
            statusText: xhr.statusText,
          })
        );
      };
      xhr.onerror = () => reject(new TypeError("Failed to fetch upload"));
      xhr.onabort = () =>
        reject(new DOMException("Upload aborted", "AbortError"));
      xhr.onloadend = () => options.signal?.removeEventListener("abort", abort);
      if (options.signal?.aborted) {
        reject(new DOMException("Upload aborted", "AbortError"));
        return;
      }
      options.signal?.addEventListener("abort", abort, { once: true });
      // The upload transport accepts FormData only; the browser supplies its boundary.
      if (!(options.body instanceof FormData)) {
        reject(new TypeError("Upload body must be FormData"));
        return;
      }
      xhr.send(options.body);
    });
}
