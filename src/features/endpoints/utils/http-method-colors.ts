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
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
      };
    case "POST":
      return {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
      };
    case "PUT":
      return {
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-600 dark:text-orange-400",
      };
    case "DELETE":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-600 dark:text-red-400",
      };
    case "PATCH":
      return {
        bg: "bg-purple-50 dark:bg-purple-950",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950",
        border: "border-gray-200 dark:border-gray-800",
        text: "text-gray-600 dark:text-gray-400",
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
