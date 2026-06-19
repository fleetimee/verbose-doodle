import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import type { OverviewData } from "@/features/overview/types";

const userStatusConfig = {
  count: {
    label: "Users",
  },
  active: {
    label: "Active Users",
    color: "var(--chart-2)",
  },
  inactive: {
    label: "Inactive Users",
    color: "var(--muted)",
  },
} satisfies ChartConfig;

const PERCENTAGE_MULTIPLIER = 100;
const CHART_INNER_RADIUS = 64;
const CHART_OUTER_RADIUS = 88;

type UserStatusChartProps = {
  data: OverviewData;
};

export function UserStatusChart({ data }: UserStatusChartProps) {
  // Early return if no user status data available
  if (
    !data.userStatusDistribution ||
    data.userStatusDistribution.length === 0
  ) {
    return null;
  }

  const activeUsers = data.userStatusDistribution.find(
    (item) => item.status === "active"
  );
  const inactiveUsers = data.userStatusDistribution.find(
    (item) => item.status === "inactive"
  );
  const totalUsers = data.userStatusDistribution.reduce(
    (acc, curr) => acc + curr.count,
    0
  );
  const activeCount = activeUsers?.count ?? 0;
  const inactiveCount = inactiveUsers?.count ?? 0;
  const percentage = Math.round(
    (activeCount / totalUsers) * PERCENTAGE_MULTIPLIER
  );

  const chartData = [
    {
      status: "active",
      count: activeCount,
      fill: "var(--color-active)",
    },
    {
      status: "inactive",
      count: inactiveCount,
      fill: "var(--color-inactive)",
    },
  ];

  return (
    <Card className="group relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-background transition-all hover:border-cyan-500/40 hover:shadow-lg md:col-span-3 lg:col-span-1 lg:row-span-2">
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Current active user accounts</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[200px] w-full"
          config={userStatusConfig}
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              endAngle={-270}
              innerRadius={CHART_INNER_RADIUS}
              outerRadius={CHART_OUTER_RADIUS}
              startAngle={90}
              stroke="none"
            >
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
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
