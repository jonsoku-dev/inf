/**
 * @description 사용자 대시보드 메인 페이지
 * @route /my/dashboard
 */

import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/common/components/ui/chart";
import type { Route } from "./+types/dashboard-page";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {
    stats: {
      // 기본 통계 데이터
    },
  };
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "대시보드 | Inf" },
    { name: "description", content: "Inf 대시보드에서 모든 활동을 관리하세요." },
  ];
};

const chartConfig = {
  views: {
    label: "Page views",
    color: "hsl(var(--chart-1))",
  },
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "January", views: 186, visitors: 100 },
  { month: "February", views: 305, visitors: 200 },
  { month: "March", views: 237, visitors: 300 },
  { month: "April", views: 73, visitors: 400 },
  { month: "May", views: 209, visitors: 500 },
  { month: "June", views: 214, visitors: 600 },
];

export default function DashboardProductPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="h-full w-full space-y-5 pl-20">
      <h1 className="mb-6 text-2xl font-semibold">Analytics</h1>
      <div>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <Area
                  dataKey="views"
                  type="natural"
                  stroke="var(--color-desktop)"
                  fill="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  dataKey="visitors"
                  type="natural"
                  stroke="var(--color-visitors)"
                  fill="var(--color-visitors)"
                  strokeWidth={2}
                  dot={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                  wrapperStyle={{
                    backgroundColor: "var(--color-desktop)",
                    minWidth: "100px",
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
