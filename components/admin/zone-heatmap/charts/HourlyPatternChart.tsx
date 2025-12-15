/* eslint-disable custom/no-inline-styles */
"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import type { HourlyDataPoint } from "@/lib/admin/zone-analytics/types";
import { HOUR_LABELS } from "@/lib/admin/zone-analytics/constants";
import { calculateGradientColor } from "@/lib/admin/chart-utils";

interface HourlyPatternChartProps {
  data: HourlyDataPoint[];
}

const chartConfig = {
  count: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Hourly Pattern Chart Component
 *
 * Bar chart showing 24-hour activity pattern for a zone
 */
export function HourlyPatternChart({ data }: HourlyPatternChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No hourly data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    hour: HOUR_LABELS[item.hour],
    count: item.count,
    hourNum: item.hour,
  }));

  // Calculate min/max for gradient
  const counts = data.map((d) => d.count);
  const minValue = Math.min(...counts);
  const maxValue = Math.max(...counts);

  // Find top 3 peak hours
  const top3Hours = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((d) => d.hour);

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
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "10px" }}
          interval={2} // Show every 3rd hour to avoid crowding
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
            const isPeak = top3Hours.includes(entry.hourNum);
            const color = isPeak
              ? "hsl(33 100% 50%)" // Orange for peak hours
              : calculateGradientColor(entry.count, minValue, maxValue);

            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
