import { Label, Pie, PieChart } from "recharts";
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
import { endpointStatusConfig } from "@/features/overview/config/chart-configs";
import { endpointStatusData } from "@/features/overview/data/overview-data";

export function EndpointStatusChart() {
  return (
    <Card className="md:col-span-1 md:row-span-2 lg:col-span-2">
      <CardHeader>
        <CardTitle>Endpoint Status Distribution</CardTitle>
        <CardDescription>
          Distribution of endpoints by current status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          className="h-full min-h-[300px] w-full"
          config={endpointStatusConfig}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Pie
              data={endpointStatusData}
              dataKey="count"
              innerRadius={60}
              nameKey="status"
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const total = endpointStatusData.reduce(
                      (acc, curr) => acc + curr.count,
                      0
                    );
                    return (
                      <text
                        dominantBaseline="middle"
                        textAnchor="middle"
                        x={viewBox.cx}
                        y={viewBox.cy}
                      >
                        <tspan
                          className="fill-foreground font-bold text-3xl"
                          x={viewBox.cx}
                          y={viewBox.cy}
                        >
                          {total}
                        </tspan>
                        <tspan
                          className="fill-muted-foreground"
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                        >
                          Endpoints
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
