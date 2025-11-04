import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
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

// Bar presentation constants
const BAR_CORNER_RADIUS = 6;
const BAR_LABEL_OFFSET = 12;
const Y_AXIS_WIDTH = 124;

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
    statusKey: `status-${item.statusCode}`,
    statusCode: `HTTP ${item.statusCode}`,
    statusLabel: item.label,
    count: item.count,
    fill: `var(--chart-${(index % CHART_COLOR_VARIANTS) + CHART_COLOR_OFFSET})`,
  }));

  // Dynamically generate chart config from the data
  const responseStatusConfig = {
    count: {
      label: "Responses",
    },
    ...Object.fromEntries(
      chartData.map((item) => [
        item.statusKey,
        {
          label: `${item.statusCode} · ${item.statusLabel}`,
          color: item.fill,
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
          className="aspect-auto h-[280px] w-full items-center px-4"
          config={responseStatusConfig}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 0, right: 12 }}
          >
            <YAxis
              axisLine={false}
              dataKey="statusCode"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              tickMargin={12}
              type="category"
              width={Y_AXIS_WIDTH}
            />
            <XAxis axisLine={false} tickLine={false} type="number" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    if (typeof value !== "number") {
                      return null;
                    }

                    const payload = item?.payload as
                      | (typeof chartData)[number]
                      | undefined;

                    if (!payload) {
                      return null;
                    }

                    const indicatorColor =
                      (item?.color as string | undefined) ?? payload.fill;

                    return (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 rounded-[2px]"
                            style={{ backgroundColor: indicatorColor }}
                          />
                          {`${payload.statusCode} · ${payload.statusLabel}`}
                        </span>
                        <span className="font-medium font-mono text-foreground tabular-nums">
                          {value.toLocaleString()}
                        </span>
                      </div>
                    );
                  }}
                  hideLabel
                />
              }
              cursor={{ fill: "hsl(var(--accent))/30" }}
            />
            <Bar
              dataKey="count"
              radius={[
                BAR_CORNER_RADIUS,
                BAR_CORNER_RADIUS,
                BAR_CORNER_RADIUS,
                BAR_CORNER_RADIUS,
              ]}
            >
              {chartData.map((entry) => (
                <Cell fill={entry.fill} key={entry.statusKey} />
              ))}
              <LabelList
                content={(props) => {
                  const { x = 0, y = 0, width = 0, height = 0, value } = props;

                  if (typeof value !== "number") {
                    return null;
                  }

                  // Convert to numbers for arithmetic operations
                  const xNum = Number(x);
                  const yNum = Number(y);
                  const widthNum = Number(width);
                  const heightNum = Number(height);

                  return (
                    <text
                      alignmentBaseline="middle"
                      className="fill-foreground font-medium"
                      x={xNum + widthNum + BAR_LABEL_OFFSET}
                      y={yNum + heightNum / 2}
                    >
                      {value.toLocaleString()}
                    </text>
                  );
                }}
                dataKey="count"
                position="right"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
