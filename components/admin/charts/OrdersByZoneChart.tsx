/* eslint-disable custom/no-inline-styles */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from "recharts";
import type { ZoneDataPoint } from "@/lib/admin/analytics";
import { calculateGradientColor } from "@/lib/admin/chart-utils";

interface OrdersByZoneChartProps {
  data: ZoneDataPoint[];
}

const chartConfig = {
  orderCount: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function OrdersByZoneChart({ data }: OrdersByZoneChartProps) {
  // Calculate min/max for gradient
  const values = data.map((d) => d.orderCount);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return (
    <Card className="bg-card border-border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Orders by Zone</CardTitle>
        <p className="text-muted-foreground text-sm">
          Delivery distribution across Guatemala City zones
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ left: 12, right: 12, top: 24, bottom: 12 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="zone"
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
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value}`}
                  formatter={(value, _, item) => {
                    const revenue = item.payload.revenue;
                    return [`${value} orders`, `Q${revenue.toFixed(2)} revenue`];
                  }}
                />
              }
            />
            <Bar dataKey="orderCount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={calculateGradientColor(entry.orderCount, minValue, maxValue)}
                />
              ))}
              <LabelList
                dataKey="orderCount"
                position="top"
                offset={8}
                className="fill-foreground text-xs font-semibold"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
