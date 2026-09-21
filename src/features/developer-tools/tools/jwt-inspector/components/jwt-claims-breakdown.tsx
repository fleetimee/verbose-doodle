import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { JwtClaimValue } from "../utils/jwt";
import { type ClaimDefinition, getClaimInfo } from "../utils/jwt-claims";

interface JwtClaimsBreakdownProps {
  readonly className?: string;
  readonly height?: string;
  readonly jsonValue: string;
  readonly type?: "header" | "payload";
}

function isClaimObject(
  value: JwtClaimValue | undefined
): value is { readonly [key: string]: JwtClaimValue } {
  return typeof value === "object" && value !== null;
}

function isParsedObject(
  value: unknown
): value is Record<string, JwtClaimValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatClaimValue(
  key: string,
  value: JwtClaimValue | undefined
): string {
  if (["iat", "exp", "nbf"].includes(key)) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      const date = new Date(num * 1000);
      if (!Number.isNaN(date.getTime())) {
        return `${num} (${date.toString()})`;
      }
    }
  }
  if (isClaimObject(value)) {
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
        {messages.jwtInspector.numericDateHintPrefix}
        <a
          className="underline hover:text-foreground"
          href="https://datatracker.ietf.org/doc/html/rfc7519#section-2"
          rel="noreferrer"
          target="_blank"
        >
          NumericDate
        </a>
        {messages.jwtInspector.numericDateHintSuffix}
      </span>
    );
  }

  if (activeClaimInfo) {
    return <span>{activeClaimInfo.description}</span>;
  }

  return <span>{messages.jwtInspector.claimsHoverHint}</span>;
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
      if (isParsedObject(data)) {
        return {
          status: "success" as const,
          // SAFETY: JSON object entries parsed from JSON input are valid claim values
          entries: Object.entries(data) as [string, JwtClaimValue][],
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

  // SAFETY: This object contains the CSS custom property consumed by the container.
  const heightStyle = height
    ? ({
        "--height": height,
      } as React.CSSProperties)
    : undefined;

  if (parsed.status === "empty") {
    return (
      <div
        className={cn(
          "flex h-[var(--height)] items-center justify-center p-6 text-center text-muted-foreground text-xs",
          className
        )}
        style={heightStyle}
      >
        {messages.jwtInspector.noClaimsData}
      </div>
    );
  }

  if (parsed.status === "invalid_json" || parsed.status === "not_object") {
    return (
      <div
        className={cn(
          "flex h-[var(--height)] items-center justify-center p-6 text-center text-destructive text-xs",
          className
        )}
        style={heightStyle}
      >
        {messages.jwtInspector.invalidJsonClaims}
      </div>
    );
  }

  if (parsed.entries.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[var(--height)] items-center justify-center p-6 text-center text-muted-foreground text-xs",
          className
        )}
        style={heightStyle}
      >
        {messages.jwtInspector.noClaimsPresent}
      </div>
    );
  }

  const activeClaimInfo = hoveredKey ? getClaimInfo(hoveredKey, type) : null;

  return (
    <div
      className={cn(
        "flex h-[var(--height)] flex-col justify-between bg-background font-mono text-sm leading-relaxed",
        className
      )}
      style={heightStyle}
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
