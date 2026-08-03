import { ArrowRight01Icon, Route01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import type { HttpMethod } from "@/features/endpoints/types";
import type { OverviewData } from "@/features/overview/types";
import { cn } from "@/lib/utils";

const methodColors: Record<HttpMethod, string> = {
  DELETE:
    "border-rose-500/25 bg-rose-500/10 text-rose-600 group-hover:border-rose-400/45 group-hover:bg-rose-500/18 group-hover:text-rose-500 group-focus-visible:border-rose-400/45 group-focus-visible:bg-rose-500/18 group-focus-visible:text-rose-500 dark:text-rose-300",
  GET: "border-sky-500/25 bg-sky-500/10 text-sky-600 group-hover:border-sky-400/45 group-hover:bg-sky-500/18 group-hover:text-sky-500 group-focus-visible:border-sky-400/45 group-focus-visible:bg-sky-500/18 group-focus-visible:text-sky-500 dark:text-sky-300",
  PATCH:
    "border-violet-500/25 bg-violet-500/10 text-violet-600 group-hover:border-violet-400/45 group-hover:bg-violet-500/18 group-hover:text-violet-500 group-focus-visible:border-violet-400/45 group-focus-visible:bg-violet-500/18 group-focus-visible:text-violet-500 dark:text-violet-300",
  POST: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 group-hover:border-emerald-400/45 group-hover:bg-emerald-500/18 group-hover:text-emerald-500 group-focus-visible:border-emerald-400/45 group-focus-visible:bg-emerald-500/18 group-focus-visible:text-emerald-500 dark:text-emerald-300",
  PUT: "border-amber-500/25 bg-amber-500/10 text-amber-600 group-hover:border-amber-400/45 group-hover:bg-amber-500/18 group-hover:text-amber-500 group-focus-visible:border-amber-400/45 group-focus-visible:bg-amber-500/18 group-focus-visible:text-amber-500 dark:text-amber-300",
};

type RecentEndpointsProps = {
  data: OverviewData;
  className?: string;
};

export function RecentEndpoints({ className, data }: RecentEndpointsProps) {
  const { prefetchEndpoint } = useEndpointCatalog();

  return (
    <Card
      className={cn(
        "border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] md:col-span-3 lg:col-span-3",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Endpoints</CardTitle>
        <CardDescription className="text-xs">
          Recently configured endpoints in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.recentEndpoints.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground shadow-xs">
              <HugeiconsIcon aria-hidden icon={Route01Icon} strokeWidth={2} />
            </div>
            <p className="mt-4 font-semibold text-sm">No endpoints yet</p>
            <p className="mt-1 max-w-[38ch] text-muted-foreground text-xs leading-relaxed">
              Recently configured endpoints will appear here once they are
              available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {data.recentEndpoints.map((endpoint) => (
              <Link
                className="group relative -mx-3 flex items-center justify-between gap-3 rounded-md border border-transparent px-3 py-4 outline-none transition-[color,background-color,border-color,box-shadow] duration-200 ease-[var(--ease-out)] first:-mt-2 last:-mb-2 hover:border-border/70 hover:bg-accent/50 hover:shadow-[0_16px_40px_-28px_var(--foreground)] focus-visible:border-border/70 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none"
                key={endpoint.endpointId}
                onFocus={() => prefetchEndpoint(String(endpoint.endpointId))}
                onMouseEnter={() =>
                  prefetchEndpoint(String(endpoint.endpointId))
                }
                to={`/dashboard/endpoints/${endpoint.endpointId}`}
              >
                <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80" />
                <div className="min-w-0 flex-1">
                  <p className="break-all font-medium font-mono text-sm leading-relaxed transition-colors group-hover:text-primary group-focus-visible:text-primary">
                    {endpoint.url}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 transition-colors group-hover:text-foreground/80 group-focus-visible:text-foreground/80">
                    <p className="text-muted-foreground text-xs transition-colors group-hover:text-foreground/70 group-focus-visible:text-foreground/70">
                      {endpoint.billerName}
                    </p>
                    <span className="text-muted-foreground transition-colors group-hover:text-primary/70 group-focus-visible:text-primary/70">
                      •
                    </span>
                    <p className="text-muted-foreground text-xs transition-colors group-hover:text-foreground/70 group-focus-visible:text-foreground/70">
                      {endpoint.responseCount} response
                      {endpoint.responseCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 font-semibold text-xs shadow-[inset_0_1px_0_color-mix(in_oklab,var(--background)_45%,transparent)] transition-[color,background-color,border-color,transform] duration-[160ms] ease-[var(--ease-out)] group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none motion-reduce:transition-none ${methodColors[endpoint.method]}`}
                >
                  {endpoint.method}
                </div>
                <HugeiconsIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-[color,transform] duration-[160ms] ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:text-primary group-focus-visible:translate-x-1 group-focus-visible:text-primary motion-reduce:transform-none motion-reduce:transition-none"
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
