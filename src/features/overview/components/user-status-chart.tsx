import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { userStatusData } from "@/features/overview/data/overview-data";

const userStatusConfig = {
  count: {
    label: "Users",
  },
  active: {
    label: "Active Users",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const PERCENTAGE_MULTIPLIER = 100;
const FULL_CIRCLE_DEGREES = 360;
const CHART_INNER_RADIUS = 80;
const CHART_OUTER_RADIUS = 110;
const POLAR_RADIUS_OUTER = 86;
const POLAR_RADIUS_INNER = 74;

export function UserStatusChart() {
  const activeUsers = userStatusData.find((item) => item.status === "active");
  const totalUsers = userStatusData.reduce((acc, curr) => acc + curr.count, 0);
  const activeCount = activeUsers?.count ?? 0;
  const percentage = Math.round(
    (activeCount / totalUsers) * PERCENTAGE_MULTIPLIER
  );

  const chartData = [
    {
      status: "active",
      count: activeCount,
      fill: "var(--color-active)",
    },
  ];

  return (
    <Card className="md:col-span-3 lg:col-span-2">
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Current active user accounts</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px] w-full"
          config={userStatusConfig}
        >
          <RadialBarChart
            data={chartData}
            endAngle={(activeCount / totalUsers) * FULL_CIRCLE_DEGREES}
            innerRadius={CHART_INNER_RADIUS}
            outerRadius={CHART_OUTER_RADIUS}
            startAngle={0}
          >
            <PolarGrid
              className="first:fill-muted last:fill-background"
              gridType="circle"
              polarRadius={[POLAR_RADIUS_OUTER, POLAR_RADIUS_INNER]}
              radialLines={false}
              stroke="none"
            />
            <RadialBar background cornerRadius={10} dataKey="count" />
            <PolarRadiusAxis axisLine={false} tick={false} tickLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        dominantBaseline="middle"
                        textAnchor="middle"
                        x={viewBox.cx}
                        y={viewBox.cy}
                      >
                        <tspan
                          className="fill-foreground font-bold text-4xl"
                          x={viewBox.cx}
                          y={viewBox.cy}
                        >
                          {percentage}%
                        </tspan>
                        <tspan
                          className="fill-muted-foreground"
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                        >
                          Active
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
