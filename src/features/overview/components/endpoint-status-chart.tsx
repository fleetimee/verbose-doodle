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
import { responseStatusData } from "@/features/overview/data/overview-data";

const responseStatusConfig = {
  count: {
    label: "Responses",
  },
  "200": {
    label: "200 (Success)",
    color: "var(--chart-2)",
  },
  "400": {
    label: "400 (Bad Request)",
    color: "var(--chart-3)",
  },
  "500": {
    label: "500 (Server Error)",
    color: "var(--chart-4)",
  },
  "404": {
    label: "404 (Not Found)",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function EndpointStatusChart() {
  return (
    <Card className="md:col-span-3 lg:col-span-2">
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
            data={responseStatusData}
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
