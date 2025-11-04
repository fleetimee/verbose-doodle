import { LabelList, RadialBar, RadialBarChart } from "recharts";
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
import type { OverviewData } from "@/features/overview/types";

// Chart color constants
const CHART_COLOR_VARIANTS = 5;
const CHART_COLOR_OFFSET = 2; // Start from chart-2 for better color variety

type EndpointStatusChartProps = {
  data: OverviewData;
  className?: string;
};

export function EndpointStatusChart({
  data,
  className,
}: EndpointStatusChartProps) {
  // Default classes for admin layout, can be overridden via className prop
  const defaultClasses = className || "md:col-span-3 lg:col-span-2";

  // Transform data to include fill property
  const chartData = data.responseStatusDistribution.map((item, index) => ({
    status: item.label,
    count: item.count,
    fill: `var(--chart-${(index % CHART_COLOR_VARIANTS) + CHART_COLOR_OFFSET})`,
  }));

  // Dynamically generate chart config from the data
  const responseStatusConfig = {
    count: {
      label: "Responses",
    },
    ...Object.fromEntries(
      data.responseStatusDistribution.map((item, index) => [
        item.statusCode,
        {
          label: item.label,
          color: `var(--chart-${(index % CHART_COLOR_VARIANTS) + CHART_COLOR_OFFSET})`,
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <Card className={defaultClasses}>
      <CardHeader>
        <CardTitle>Response Status Code Distribution</CardTitle>
        <CardDescription>
          Configured responses by HTTP status code
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px] w-full"
          config={responseStatusConfig}
        >
          <RadialBarChart
            data={chartData}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
            startAngle={-90}
          >
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="status" />}
              cursor={false}
            />
            <RadialBar background dataKey="count">
              <LabelList
                className="fill-white capitalize mix-blend-luminosity"
                dataKey="status"
                fontSize={11}
                position="insideStart"
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
