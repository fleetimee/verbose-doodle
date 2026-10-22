import { z } from "zod";
import { getErrorMessage } from "@/lib/error-handler";
import { messages } from "@/lib/i18n";

const logErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  status: z.number().optional(),
});

export function getLogErrorMessage(cause: unknown): string {
  const copy = messages.logViewer;
  const parsed = logErrorSchema.safeParse(cause);
  if (!parsed.success) {
    return getErrorMessage(cause);
  }
  const error = parsed.data;
  const mapped = new Map([
    ["LOG_AUTH", copy.errorAuth],
    ["LOG_ACCESS", copy.errorAccess],
    ["LOG_SHARE", copy.errorShare],
    ["LOG_PATH", copy.errorPath],
    ["LOG_CONNECT", copy.errorConnect],
    ["LOG_TIMEOUT", copy.errorTimeout],
    ["LOG_STORAGE", copy.errorStorage],
    ["LOG_BACKEND", copy.errorBackend],
    ["LOG_CREDENTIALS", copy.errorCredentials],
    ["LOG_SOURCE_MISSING", copy.errorSourceMissing],
    ["LOG_VALIDATION", copy.errorValidation],
    ["LOG_SMB", copy.errorSmb],
  ]);
  const message = error.code ? mapped.get(error.code) : undefined;
  if (message) {
    return message;
  }
  if (error.code === "LOG_SETTINGS" && error.message) {
    return error.message;
  }
  if (
    error.code === "NETWORK_ERROR" ||
    (cause instanceof TypeError && cause.message.includes("fetch"))
  ) {
    return copy.errorOffline;
  }
  if (error.code === "TIMEOUT" || error.status === 504) {
    return copy.errorTimeout;
  }
  if (error.status && error.status >= 500) {
    return copy.errorBackend;
  }
  return getErrorMessage(cause);
}
