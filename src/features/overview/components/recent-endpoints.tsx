import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentEndpointsData } from "@/features/overview/data/overview-data";

const methodColors = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  POST: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  PATCH:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
} as const;

export function RecentEndpoints() {
  return (
    <Card className="md:col-span-3 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Endpoints</CardTitle>
        <CardDescription>
          Recently configured endpoints in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEndpointsData.map((endpoint) => (
            <div
              className="flex items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              key={endpoint.id}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="break-all font-medium text-sm leading-none">
                  {endpoint.url}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-muted-foreground text-xs">
                    {endpoint.biller}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-muted-foreground text-xs">
                    {endpoint.responsesCount} response
                    {endpoint.responsesCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className={`shrink-0 rounded-full px-2.5 py-0.5 font-semibold text-xs ${methodColors[endpoint.method]}`}
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
