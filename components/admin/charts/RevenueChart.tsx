"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { RevenueDataPoint } from "@/lib/admin/analytics";

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="bg-card border-border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Revenue Over Time</CardTitle>
        <p className="text-muted-foreground text-sm">Weekly revenue trends for the last 90 days</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(33 100% 60%)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="hsl(33 75% 45%)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Q${value}`}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      const orderCount = payload[0].payload.orderCount;
                      return `${payload[0].payload.date} (${orderCount} orders)`;
                    }
                    return "";
                  }}
                  formatter={(value) => `Q${Number(value).toFixed(2)}`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(33 100% 60%)"
              fill="url(#fillRevenue)"
              fillOpacity={1}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
