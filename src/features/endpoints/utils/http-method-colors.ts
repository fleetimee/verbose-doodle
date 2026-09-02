/**
 * HTTP method color mappings
 * These colors follow common API development tool conventions
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type MethodColorConfig = {
  text: string;
  bg: string;
  border: string;
};

/**
 * Get color classes for an HTTP method
 * Uses Tailwind CSS color classes
 */
export function getMethodColor(method: HttpMethod): MethodColorConfig {
  switch (method) {
    case "GET":
      return {
        bg: "bg-sky-500/15 dark:bg-sky-950/60",
        border:
          "border-sky-500/40 border-b-sky-500/80 dark:border-sky-500/50 dark:border-b-sky-400",
        text: "text-sky-600 dark:text-sky-300",
      };
    case "POST":
      return {
        bg: "bg-emerald-500/15 dark:bg-emerald-950/60",
        border:
          "border-emerald-500/40 border-b-emerald-500/80 dark:border-emerald-500/50 dark:border-b-emerald-400",
        text: "text-emerald-600 dark:text-emerald-300",
      };
    case "PUT":
      return {
        bg: "bg-amber-500/15 dark:bg-amber-950/60",
        border:
          "border-amber-500/40 border-b-amber-500/80 dark:border-amber-500/50 dark:border-b-amber-400",
        text: "text-amber-600 dark:text-amber-300",
      };
    case "DELETE":
      return {
        bg: "bg-rose-500/15 dark:bg-rose-950/60",
        border:
          "border-rose-500/40 border-b-rose-500/80 dark:border-rose-500/50 dark:border-b-rose-400",
        text: "text-rose-600 dark:text-rose-300",
      };
    case "PATCH":
      return {
        bg: "bg-purple-500/15 dark:bg-purple-950/60",
        border:
          "border-purple-500/40 border-b-purple-500/80 dark:border-purple-500/50 dark:border-b-purple-400",
        text: "text-purple-600 dark:text-purple-300",
      };
    default:
      return {
        bg: "bg-muted dark:bg-muted",
        border: "border-border border-b-muted-foreground/50",
        text: "text-muted-foreground",
      };
  }
}

/**
 * Get simplified text color for inline display
 */
export function getMethodTextColor(method: HttpMethod): string {
  return getMethodColor(method).text;
}

/**
 * Get combined badge classes (text, background, and border) for badges
 */
export function getMethodBadgeColor(method: HttpMethod): string {
  const colors = getMethodColor(method);
  return `${colors.text} ${colors.bg} ${colors.border}`;
}

const METHOD_ABBREVIATION_LENGTH = 3;

/**
 * Abbreviate HTTP method to 3 letters for consistent badge width
 */
export function abbreviateMethod(method: HttpMethod): string {
  switch (method) {
    case "GET":
      return "GET";
    case "POST":
      return "PST";
    case "PUT":
      return "PUT";
    case "DELETE":
      return "DEL";
    case "PATCH":
      return "PAT";
    default:
      // Exhaustiveness check - this should never be reached since all cases are handled
      return (method as string)
        .slice(0, METHOD_ABBREVIATION_LENGTH)
        .toUpperCase();
  }
}
