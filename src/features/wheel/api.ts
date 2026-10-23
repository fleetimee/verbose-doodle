import { z } from "zod";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const wheelModeSchema = z.enum([
  "SINGLE",
  "WITHOUT_REPLACEMENT",
  "WITH_REPLACEMENT",
]);
const configSchema = z.object({
  version: z.number().int(),
  id: z.string().uuid(),
  title: z.string(),
  entries: z.array(z.string()).min(2).max(100),
  mode: wheelModeSchema,
  drawLimit: z.number().int(),
  durationMs: z.number().int(),
  createdAt: z.string(),
  createdBy: z.string(),
});
const drawSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int(),
  requestId: z.string().uuid(),
  at: z.string(),
  by: z.string(),
  previousHash: z.string(),
  eligible: z.array(z.number().int()),
  winnerIndex: z.number().int(),
  durationMs: z.number().int(),
  rotationMilliDegrees: z.number().int(),
});
const sealSchema = z.object({
  at: z.string(),
  by: z.string(),
  previousHash: z.string(),
  drawCount: z.number().int(),
});
const signedSchema = z.object({
  payload: z.string(),
  hash: z.string(),
  signature: z.string(),
});
export const evidenceSchema = z.object({
  format: z.literal("fleetime-wheel-v1"),
  keyId: z.string(),
  configuration: signedSchema,
  draws: z.array(signedSchema).max(200),
  seal: signedSchema.nullable(),
  head: signedSchema,
});
const viewSchema = z.object({
  config: configSchema,
  draws: z.array(drawSchema),
  seal: sealSchema.nullable(),
  evidence: evidenceSchema,
  verified: z.boolean(),
});
const summarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  mode: wheelModeSchema,
  createdAt: z.string(),
  entries: z.array(z.string()).min(2).max(100),
  entryCount: z.number().int(),
  drawCount: z.number().int(),
  completed: z.boolean(),
});
const pageSchema = z.object({
  items: z.array(summarySchema),
  page: z.number().int(),
  totalPages: z.number().int(),
});
export type WheelMode = z.infer<typeof wheelModeSchema>;
export type WheelDraw = z.infer<typeof drawSchema>;
export type WheelView = z.infer<typeof viewSchema>;
export type WheelEvidence = z.infer<typeof evidenceSchema>;
export interface CreateWheel {
  drawLimit: number;
  durationSeconds: number;
  entries: string[];
  mode: WheelMode;
  title: string;
}
const root = API_ENDPOINTS.admin.wheelSessions;
export async function fetchWheelSessions(page: number) {
  const result = await apiGet<{ data: unknown }>(`${root}?page=${page}`, {
    cache: "no-store",
  });
  return pageSchema.parse(result.data);
}
export async function fetchWheel(id: string) {
  const result = await apiGet<{ data: unknown }>(
    `${root}/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );
  return viewSchema.parse(result.data);
}
export async function createWheel(request: CreateWheel) {
  const result = await apiPost<{ data: unknown }>(root, request);
  return viewSchema.parse(result.data);
}
export async function spinWheel(id: string, requestId: string) {
  const result = await apiPost<{ data: unknown }>(
    `${root}/${encodeURIComponent(id)}/spin`,
    { requestId }
  );
  return viewSchema.parse(result.data);
}
export async function completeWheel(id: string) {
  const result = await apiPost<{ data: unknown }>(
    `${root}/${encodeURIComponent(id)}/complete`
  );
  return viewSchema.parse(result.data);
}
export async function verifyWheelEvidence(evidence: WheelEvidence) {
  const result = await apiPost<{ data: unknown }>(`${root}/verify`, evidence);
  return z.object({ verified: z.boolean() }).parse(result.data).verified;
}
export function downloadWheelEvidence(view: WheelView) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(view.evidence, null, 2)], {
      type: "application/json",
    })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `wheel-evidence-${view.config.id}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function verifyWheelHash(id: string, hash: string) {
  const result = await apiPost<{ data: unknown }>(
    `${root}/${encodeURIComponent(id)}/verify-hash`,
    { hash }
  );
  return z.object({ verified: z.boolean() }).parse(result.data).verified;
}

const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const sharedWheelSchema = z.object({
  title: z.string(),
  entries: z.array(z.string()).min(2).max(100),
  mode: wheelModeSchema,
  completedAt: z.string(),
  draws: z
    .array(drawSchema.omit({ requestId: true, by: true, previousHash: true }))
    .max(200),
  hash: z.string(),
  verified: z.literal(true),
});
export type SharedWheel = z.infer<typeof sharedWheelSchema>;
export async function fetchSharedWheel(token: string) {
  const result = await apiGet<{ data: unknown }>(
    `/api/public/wheels/${encodeURIComponent(token)}`,
    {
      auth: false,
      cache: "no-store",
      emitUnauthorized: false,
      retryOnUnauthorized: false,
    }
  );
  return sharedWheelSchema.parse(result.data);
}
export async function shareWheel(id: string) {
  const result = await apiPost<{ data: unknown }>(
    `${root}/${encodeURIComponent(id)}/share`
  );
  return z
    .object({ token: z.string().regex(SHARE_TOKEN_PATTERN) })
    .parse(result.data).token;
}
export async function revokeWheelShare(id: string) {
  await apiDelete(`${root}/${encodeURIComponent(id)}/share`);
}
