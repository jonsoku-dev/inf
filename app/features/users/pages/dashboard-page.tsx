/**
 * @description 사용자 대시보드 메인 페이지
 * @route /my/dashboard
 */

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
  desktop: {
    label: "👀",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="h-full w-full space-y-5 pl-20">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Profile views</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
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
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="desktop"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
