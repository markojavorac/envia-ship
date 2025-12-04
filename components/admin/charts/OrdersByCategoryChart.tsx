"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, Label } from "recharts";
import type { CategoryDataPoint } from "@/lib/admin/analytics";

interface CategoryLegendProps {
  data: CategoryDataPoint[];
}

function CategoryLegend({ data }: CategoryLegendProps) {
  return (
    <div className="w-full md:w-44 flex-shrink-0">
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.category} className="flex items-start gap-3">
            {/* Color indicator - larger and more visible */}
            <div
              className="h-3 w-3 rounded-sm mt-0.5 flex-shrink-0"
              style={{ backgroundColor: item.fill }}
            />

            {/* Labels - two line format */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {item.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.value} orders ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OrdersByCategoryChartProps {
  data: CategoryDataPoint[];
}

export function OrdersByCategoryChart({ data }: OrdersByCategoryChartProps) {
  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);

  // Build chartConfig dynamically from data for legend
  const chartConfig = data.reduce((config, item) => {
    config[item.category] = {
      label: item.category,
      color: item.fill,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="bg-card border-border rounded-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Orders by Category</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution across product categories
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Responsive flex container: stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-2">

          {/* Custom Legend - LEFT side */}
          <CategoryLegend data={data} />

          {/* Chart - RIGHT side, larger and flexible */}
          <ChartContainer config={chartConfig} className="h-[260px] md:h-[280px] w-full md:flex-1">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.category;
                      }
                      return "";
                    }}
                    formatter={(value, _, item) => {
                      const percentage = item.payload.percentage;
                      return `${value} orders (${percentage}%)`;
                    }}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="category"
                innerRadius={65}
                outerRadius={115}
                paddingAngle={2}
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalOrders}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Orders
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
