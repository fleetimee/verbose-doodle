import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { endpointsByBillerData } from "@/features/overview/data/overview-data";

const endpointsByBillerConfig = {
  count: {
    label: "Endpoints",
  },
  BCA: {
    label: "BCA",
    color: "var(--chart-1)",
  },
  Mandiri: {
    label: "Mandiri",
    color: "var(--chart-2)",
  },
  BNI: {
    label: "BNI",
    color: "var(--chart-3)",
  },
  BRI: {
    label: "BRI",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

// Bar chart corner radius constants
const BAR_CORNER_RADIUS_TOP_RIGHT = 8;
const BAR_CORNER_RADIUS_BOTTOM_RIGHT = 8;
const BAR_CORNER_RADIUS_BOTTOM_LEFT = 0;
const BAR_CORNER_RADIUS_TOP_LEFT = 0;

export function EndpointsByBillerChart() {
  return (
    <Card className="md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle>Endpoints by Biller</CardTitle>
        <CardDescription>
          Distribution of endpoints across billers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[250px] w-full"
          config={endpointsByBillerConfig}
        >
          <BarChart
            accessibilityLayer
            data={endpointsByBillerData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              axisLine={false}
              dataKey="biller"
              tick={{ fill: "hsl(var(--foreground))" }}
              tickLine={false}
              tickMargin={10}
              type="category"
              width={60}
            />
            <XAxis axisLine={false} tickLine={false} type="number" />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar
              dataKey="count"
              radius={[
                BAR_CORNER_RADIUS_TOP_LEFT,
                BAR_CORNER_RADIUS_TOP_RIGHT,
                BAR_CORNER_RADIUS_BOTTOM_RIGHT,
                BAR_CORNER_RADIUS_BOTTOM_LEFT,
              ]}
            >
              {endpointsByBillerData.map((entry) => (
                <Cell
                  fill={`var(--color-${entry.biller})`}
                  key={`cell-${entry.biller}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
