import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { endpointUsageConfig } from "@/features/overview/config/chart-configs";
import { endpointUsageData } from "@/features/overview/data/overview-data";

export function EndpointUsageChart() {
  return (
    <Card className="md:col-span-2 md:row-span-2">
      <CardHeader>
        <CardTitle>Endpoint Usage Trend</CardTitle>
        <CardDescription>
          Total requests and successful responses over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-full min-h-[300px] w-full"
          config={endpointUsageConfig}
        >
          <LineChart accessibilityLayer data={endpointUsageData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="requests"
              dot={false}
              stroke="var(--color-requests)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="success"
              dot={false}
              stroke="var(--color-success)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
