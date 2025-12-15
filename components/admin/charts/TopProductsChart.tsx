/* eslint-disable custom/no-inline-styles */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, LabelList, Cell } from "recharts";
import type { ProductSalesDataPoint } from "@/lib/admin/analytics";
import { calculateGradientColor } from "@/lib/admin/chart-utils";

interface TopProductsChartProps {
  data: ProductSalesDataPoint[];
}

const chartConfig = {
  unitsSold: {
    label: "Units Sold",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function TopProductsChart({ data }: TopProductsChartProps) {
  // Calculate min/max for gradient
  const values = data.map((d) => d.unitsSold);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return (
    <Card className="bg-card border-border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Top 10 Products</CardTitle>
        <p className="text-muted-foreground text-sm">Best selling products by units sold</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 120, right: 24, top: 12, bottom: 12 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="productName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={110}
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "11px" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `${value}`}
                  formatter={(value, _, item) => {
                    const revenue = item.payload.revenue;
                    return [`${value} units`, `Q${revenue.toFixed(2)} revenue`];
                  }}
                />
              }
            />
            <Bar dataKey="unitsSold" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={calculateGradientColor(entry.unitsSold, minValue, maxValue)}
                />
              ))}
              <LabelList
                dataKey="unitsSold"
                position="right"
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
