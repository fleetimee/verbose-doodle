import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type ClaimDefinition, getClaimInfo } from "../utils/jwt-claims";

interface JwtClaimsBreakdownProps {
  readonly className?: string;
  readonly height?: string;
  readonly jsonValue: string;
  readonly type?: "header" | "payload";
}

function formatClaimValue(key: string, value: unknown): string {
  if (["iat", "exp", "nbf"].includes(key)) {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num) && num > 0) {
      const date = new Date(num * 1000);
      if (!Number.isNaN(date.getTime())) {
        return `${num} (${date.toString()})`;
      }
    }
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

function renderFooterNote(
  hoveredKey: string | null,
  hasTimestamp: boolean,
  activeClaimInfo: ClaimDefinition | null | undefined
) {
  const isHoveredTimestamp =
    hoveredKey !== null && ["iat", "exp", "nbf"].includes(hoveredKey);

  if (isHoveredTimestamp || (!hoveredKey && hasTimestamp)) {
    return (
      <span>
        This value must be a{" "}
        <a
          className="underline hover:text-foreground"
          href="https://datatracker.ietf.org/doc/html/rfc7519#section-2"
          rel="noreferrer"
          target="_blank"
        >
          NumericDate
        </a>{" "}
        type, representing seconds.
      </span>
    );
  }

  if (activeClaimInfo) {
    return <span>{activeClaimInfo.description}</span>;
  }

  return <span>Click or hover over claims for specification details.</span>;
}

export function JwtClaimsBreakdown({
  className,
  height = "220px",
  jsonValue,
  type,
}: JwtClaimsBreakdownProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!jsonValue.trim()) {
      return { status: "empty" as const, entries: [] };
    }
    try {
      const data = JSON.parse(jsonValue);
      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        return {
          status: "success" as const,
          entries: Object.entries(data),
        };
      }
      return { status: "not_object" as const, entries: [] };
    } catch {
      return { status: "invalid_json" as const, entries: [] };
    }
  }, [jsonValue]);

  const hasTimestamp = useMemo(
    () => parsed.entries.some(([k]) => ["iat", "exp", "nbf"].includes(k)),
    [parsed.entries]
  );

  if (parsed.status === "empty") {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-6 text-center text-muted-foreground text-xs",
          className
        )}
        style={{ height }}
      >
        No claims data available.
      </div>
    );
  }

  if (parsed.status === "invalid_json" || parsed.status === "not_object") {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-6 text-center text-destructive text-xs",
          className
        )}
        style={{ height }}
      >
        Invalid JSON syntax. Cannot display claims breakdown.
      </div>
    );
  }

  if (parsed.entries.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-6 text-center text-muted-foreground text-xs",
          className
        )}
        style={{ height }}
      >
        No claims present in this object.
      </div>
    );
  }

  const activeClaimInfo = hoveredKey ? getClaimInfo(hoveredKey, type) : null;

  return (
    <div
      className={cn(
        "flex flex-col justify-between bg-background font-mono text-sm leading-relaxed",
        className
      )}
      style={{ height }}
    >
      <ScrollArea className="min-h-0 w-full flex-1">
        <table className="w-full border-collapse text-left">
          <tbody>
            {parsed.entries.map(([key, value]) => {
              const formattedVal = formatClaimValue(key, value);
              return (
                <tr
                  className="border-border/40 border-b transition-colors hover:bg-muted/15"
                  key={key}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                >
                  <td className="w-32 min-w-[90px] max-w-[140px] select-text border-border/40 border-r px-4 py-2.5 align-middle font-mono text-foreground/90 text-xs sm:w-40 sm:text-sm">
                    {key}
                  </td>
                  <td className="select-text break-all px-4 py-2.5 align-middle font-mono text-foreground/95 text-xs sm:text-sm">
                    {formattedVal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>

      {/* Helper footnote at bottom */}
      <div className="border-border/40 border-t bg-muted/5 px-4 py-2.5 font-sans text-muted-foreground text-xs">
        {renderFooterNote(hoveredKey, hasTimestamp, activeClaimInfo)}
      </div>
    </div>
  );
}
