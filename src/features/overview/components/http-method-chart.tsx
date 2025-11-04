import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { methodDistributionConfig } from "@/features/overview/config/chart-configs";
import type { OverviewData } from "@/features/overview/types";

// Bar chart corner radius constants
const BAR_CORNER_RADIUS_TOP_LEFT = 8;
const BAR_CORNER_RADIUS_TOP_RIGHT = 8;
const BAR_CORNER_RADIUS_BOTTOM_RIGHT = 0;
const BAR_CORNER_RADIUS_BOTTOM_LEFT = 0;

type HttpMethodChartProps = {
  data: OverviewData;
  className?: string;
};

export function HttpMethodChart({ data, className }: HttpMethodChartProps) {
  // Default classes for admin layout, can be overridden via className prop
  const defaultClasses = className || "md:col-span-2 lg:col-span-2";

  // Transform data to include fill colors based on method
  const chartData = data.methodDistribution.map((item) => ({
    ...item,
    fill: `var(--color-${item.method.toLowerCase()})`,
  }));

  return (
    <Card className={defaultClasses}>
      <CardHeader>
        <CardTitle>HTTP Method Distribution</CardTitle>
        <CardDescription>Endpoint count by HTTP method type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[300px] w-full"
          config={methodDistributionConfig}
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="method"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[
                BAR_CORNER_RADIUS_TOP_LEFT,
                BAR_CORNER_RADIUS_TOP_RIGHT,
                BAR_CORNER_RADIUS_BOTTOM_RIGHT,
                BAR_CORNER_RADIUS_BOTTOM_LEFT,
              ]}
            >
              {chartData.map((entry) => (
                <Cell fill={entry.fill} key={`cell-${entry.method}`} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
