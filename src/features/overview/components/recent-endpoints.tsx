import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentEndpointsData } from "@/features/overview/data/overview-data";

export function RecentEndpoints() {
  return (
    <Card className="md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle>Recent Endpoints</CardTitle>
        <CardDescription>
          Your most recently created or modified endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEndpointsData.map((endpoint) => (
            <div
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              key={endpoint.id}
            >
              <div className="space-y-1">
                <p className="font-medium text-sm leading-none">
                  {endpoint.name}
                </p>
                <p className="text-muted-foreground text-sm">{endpoint.date}</p>
              </div>
              <div
                className={`rounded-full px-2.5 py-0.5 font-semibold text-xs ${
                  endpoint.method === "GET"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                }`}
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
