export type RedirectLocation = {
  hash?: string;
  pathname: string;
  search?: string;
};

const DISALLOWED_TARGET_PREFIXES = ["//", "/\\"];
const BLOCKED_TARGET_PATHS = new Set(["/login", "/logged-out", "/"]);
const QUERY_OR_HASH_REGEX = /[?#]/;

/**
 * Validates and normalizes a redirect target to ensure it is a safe internal application path.
 * Falls back to a safe default (e.g. `/dashboard`) if the path is invalid, external, or causes a loop.
 */
export function getSafeRedirectPath(
  from: unknown,
  fallback = "/dashboard"
): string {
  let target = "";

  if (typeof from === "string") {
    target = from;
  } else if (
    from &&
    typeof from === "object" &&
    "pathname" in from &&
    typeof (from as { pathname: unknown }).pathname === "string"
  ) {
    const loc = from as RedirectLocation;
    target = `${loc.pathname}${loc.search ?? ""}${loc.hash ?? ""}`;
  }

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
