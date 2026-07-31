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
import { messages } from "@/lib/i18n";

const userStatusConfig = {
  active: {
    color: "var(--chart-2)",
    label: messages.overview.chartLabels.activeUsers,
  },
  count: {
    label: messages.overview.chartLabels.users,
  },
  inactive: {
    color: "var(--muted)",
    label: messages.overview.chartLabels.inactiveUsers,
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
      count: activeCount,
      fill: "var(--color-active)",
      status: "active",
    },
    {
      count: inactiveCount,
      fill: "var(--color-inactive)",
      status: "inactive",
    },
  ];

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] md:col-span-3 lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {messages.overview.activeUsersTitle}
        </CardTitle>
        <CardDescription className="text-xs">
          {messages.overview.currentActiveAccountsDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[260px] items-center justify-center pb-0">
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
                          {messages.overview.chartLabels.active}
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
