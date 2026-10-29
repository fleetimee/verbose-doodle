import { z } from "zod";
import { apiDelete, apiFetch, apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const fileSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string(),
  size: z.number(),
  createdAt: z.string(),
  expiresAt: z.string(),
  downloadPath: z
    .string()
    .regex(
      /^(?:\/api\/f\/(?:[A-Za-z0-9_-]{12}|[A-Za-z0-9_-]{43})(?:\.[A-Za-z0-9]{1,10})?|\/api\/public\/temp-files\/[A-Za-z0-9_-]{43})$/
    ),
});
const listSchema = z.object({
  items: z.array(fileSchema),
  usedBytes: z.number(),
  quotaBytes: z.number(),
  maxFileBytes: z.number(),
  maxFiles: z.number(),
  storedFiles: z.number(),
});
export type TempFile = z.infer<typeof fileSchema>;
const baseUrl = (import.meta.env.VITE_TEMP_FILES_URL ?? "").replace(/\/$/, "");
const root = API_ENDPOINTS.admin.tempFiles;
export async function fetchTempFiles(signal?: AbortSignal) {
  const response = await apiGet<{ data: unknown }>(root, {
    baseUrl,
    cache: "no-store",
    signal,
  });
  return listSchema.parse(response.data);
}
export async function uploadTempFile(
  file: File,
  retentionHours: number,
  signal: AbortSignal,
  onUploadProgress: (percent: number) => void
) {
  const body = new FormData();
  body.append("file", file);
  body.append("retentionHours", String(retentionHours));
  const response = await apiFetch<{ data: unknown }>(root, {
    baseUrl,
    body,
    method: "POST",
    timeout: 600_000,
    signal,
    onUploadProgress,
  });
  return fileSchema.parse(response.data);
}
export async function deleteTempFile(id: string) {
  await apiDelete(`${root}/${encodeURIComponent(id)}`, { baseUrl });
}
export function tempFileDownloadUrl(file: TempFile) {
  return new URL(`${baseUrl}${file.downloadPath}`, window.location.origin).href;
}
export function formatFileBytes(bytes: number, locale: string) {
  const units = ["B", "KiB", "MiB", "GiB"];
  const index = Math.min(
    Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)),
    units.length - 1
  );
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1024 ** index)} ${units[index]}`;
}
