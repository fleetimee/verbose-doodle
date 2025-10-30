import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { responseTimeConfig } from "@/features/overview/config/chart-configs";
import { responseTimeData } from "@/features/overview/data/overview-data";

export function ResponseTimeChart() {
  return (
    <Card className="md:col-span-3 lg:col-span-4">
      <CardHeader>
        <CardTitle>Response Time Trends</CardTitle>
        <CardDescription>
          Average and P95 response times (ms) over the last 10 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[300px] w-full"
          config={responseTimeConfig}
        >
          <AreaChart accessibilityLayer data={responseTimeData}>
            <defs>
              <linearGradient
                id="fillAvgResponseTime"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-avgResponseTime)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-avgResponseTime)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillP95ResponseTime"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-p95ResponseTime)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-p95ResponseTime)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="avgResponseTime"
              fill="url(#fillAvgResponseTime)"
              stroke="var(--color-avgResponseTime)"
              type="natural"
            />
            <Area
              dataKey="p95ResponseTime"
              fill="url(#fillP95ResponseTime)"
              stroke="var(--color-p95ResponseTime)"
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
