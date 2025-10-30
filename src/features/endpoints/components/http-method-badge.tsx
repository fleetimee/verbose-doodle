import {
  getMethodColor,
  type HttpMethod,
} from "@/features/endpoints/utils/http-method-colors";
import { cn } from "@/lib/utils";

type HttpMethodBadgeProps = {
  method: HttpMethod;
  variant?: "text" | "badge";
  className?: string;
};

/**
 * Display an HTTP method with color coding
 *
 * @example
 * ```tsx
 * <HttpMethodBadge method="GET" variant="badge" />
 * <HttpMethodBadge method="POST" variant="text" />
 * ```
 */
export function HttpMethodBadge({
  method,
  variant = "text",
  className,
}: HttpMethodBadgeProps) {
  const colors = getMethodColor(method);

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs transition-colors",
          colors.text,
          colors.bg,
          colors.border,
          className
        )}
      >
        {method}
      </span>
    );
  }

  return (
    <span className={cn("font-semibold", colors.text, className)}>
      {method}
    </span>
  );
}
