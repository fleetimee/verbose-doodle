import { z } from "zod";

export type RedirectLocation = {
  hash?: string;
  pathname: string;
  search?: string;
};

const redirectInputSchema = z.union([
  z.string(),
  z.object({
    pathname: z.string(),
    search: z.string().nullish(),
    hash: z.string().nullish(),
  }),
]);

type RedirectInput = Parameters<typeof redirectInputSchema.safeParse>[0];

function isRedirectLocation(
  value: z.infer<typeof redirectInputSchema>
): value is Exclude<z.infer<typeof redirectInputSchema>, string> {
  return typeof value === "object";
}

const DISALLOWED_TARGET_PREFIXES = ["//", "/\\"];
const BLOCKED_TARGET_PATHS = new Set(["/login", "/logged-out", "/"]);
const QUERY_OR_HASH_REGEX = /[?#]/;

/**
 * Validates and normalizes a redirect target to ensure it is a safe internal application path.
 * Falls back to a safe default (e.g. `/dashboard`) if the path is invalid, external, or causes a loop.
 */
export function getSafeRedirectPath(
  from: RedirectInput,
  fallback = "/dashboard"
): string {
  const parsed = redirectInputSchema.safeParse(from);
  if (!parsed.success) {
    return fallback;
  }
  const location = parsed.data;
  let target = isRedirectLocation(location)
    ? `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`
    : location;

  target = target.trim();

  if (
    !target.startsWith("/") ||
    DISALLOWED_TARGET_PREFIXES.some((prefix) => target.startsWith(prefix)) ||
    target.includes("\r") ||
    target.includes("\n")
  ) {
    return fallback;
  }

  const pathWithoutQuery = target.split(QUERY_OR_HASH_REGEX)[0];
  if (BLOCKED_TARGET_PATHS.has(pathWithoutQuery)) {
    return fallback;
  }

  return target;
}
