import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { methodDistributionData } from "@/features/overview/data/overview-data";

// Bar chart corner radius constants
const BAR_CORNER_RADIUS_TOP_LEFT = 8;
const BAR_CORNER_RADIUS_TOP_RIGHT = 8;
const BAR_CORNER_RADIUS_BOTTOM_RIGHT = 0;
const BAR_CORNER_RADIUS_BOTTOM_LEFT = 0;

export function HttpMethodChart() {
  return (
    <Card className="md:col-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>HTTP Method Distribution</CardTitle>
        <CardDescription>Endpoint count by HTTP method type</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[300px] w-full"
          config={methodDistributionConfig}
        >
          <BarChart accessibilityLayer data={methodDistributionData}>
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
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
