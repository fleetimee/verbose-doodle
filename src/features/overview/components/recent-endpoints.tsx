import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HttpMethod } from "@/features/endpoints/types";
import type { OverviewData } from "@/features/overview/types";

const methodColors: Record<HttpMethod, string> = {
  GET: "border-primary/20 bg-primary/10 text-primary",
  POST: "border-primary/20 bg-primary/10 text-primary",
  PUT: "border-border bg-secondary text-secondary-foreground",
  DELETE: "border-destructive/20 bg-destructive/10 text-destructive",
  PATCH: "border-border bg-secondary text-secondary-foreground",
};

type RecentEndpointsProps = {
  data: OverviewData;
};

export function RecentEndpoints({ data }: RecentEndpointsProps) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] md:col-span-3 lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Endpoints</CardTitle>
        <CardDescription className="text-xs">
          Recently configured endpoints in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/70">
          {data.recentEndpoints.map((endpoint) => (
            <div
              className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              key={endpoint.endpointId}
            >
              <div className="min-w-0 flex-1">
                <p className="break-all font-medium font-mono text-sm leading-relaxed">
                  {endpoint.url}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-muted-foreground text-xs">
                    {endpoint.billerName}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-muted-foreground text-xs">
                    {endpoint.responseCount} response
                    {endpoint.responseCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div
                className={`shrink-0 rounded-full border px-2.5 py-0.5 font-semibold text-xs ${methodColors[endpoint.method]}`}
              >
                {endpoint.method}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
