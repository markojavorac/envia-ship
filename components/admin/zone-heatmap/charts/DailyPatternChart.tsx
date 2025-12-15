/* eslint-disable custom/no-inline-styles */
"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import type { DailyDataPoint } from "@/lib/admin/zone-analytics/types";
import { calculateGradientColor } from "@/lib/admin/chart-utils";

interface DailyPatternChartProps {
  data: DailyDataPoint[];
}

const chartConfig = {
  count: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Daily Pattern Chart Component
 *
 * Bar chart showing day-of-week activity pattern for a zone
 */
export function DailyPatternChart({ data }: DailyPatternChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No daily data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    day: item.day,
    count: item.count,
    dayOfWeek: item.dayOfWeek,
  }));

  // Calculate min/max for gradient
  const counts = data.map((d) => d.count);
  const minValue = Math.min(...counts);
  const maxValue = Math.max(...counts);

  // Find top 2 peak days
  const top2Days = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((d) => d.dayOfWeek);

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart data={chartData} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          strokeOpacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "11px" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "10px" }}
          width={30}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => `${value}`}
              formatter={(value) => [`${value} orders`]}
            />
          }
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => {
            const isPeak = top2Days.includes(entry.dayOfWeek);
            const color = isPeak
              ? "hsl(33 100% 50%)" // Orange for peak days
              : calculateGradientColor(entry.count, minValue, maxValue);

            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
