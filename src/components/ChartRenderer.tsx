// app/components/ChartRenderer.tsx
"use client";

import React from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Cell,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartSpec {
  mark?: string;
  type?: string;
  data?: { values: any[] } | any[];
  xField?: string;
  yField?: string;
  title?: string;
  description?: string;
  encoding?: {
    x?: { field?: string };
    y?: { field?: string };
  };
}

const formatXAxisTick = (value: any) => {
  if (typeof value === "string" && value.length > 12) {
    return `${value.slice(0, 12)}...`;
  }
  return value;
};

export const ChartRenderer: React.FC<{ spec: ChartSpec }> = ({ spec }) => {
  // Get chart type
  const chartType = spec.mark || spec.type || "bar";

  // Get data
  const data = Array.isArray(spec.data) ? spec.data : spec.data?.values || [];

  // Get fields from encoding or fall back to defaults
  let xField = spec.xField || "name";
  let yField = spec.yField || "value";

  // Extract fields from encoding if present
  if (spec.encoding) {
    if (spec.encoding.x?.field) {
      xField = spec.encoding.x.field;
    }
    if (spec.encoding.y?.field) {
      yField = spec.encoding.y.field;
    }
  }

  // For multi-series data, detect all numeric fields
  const numericFields =
    data.length > 0
      ? Object.keys(data[0]).filter(
          (key) => key !== xField && typeof data[0][key] === "number"
        )
      : [yField];

  // Create config for all numeric fields
  const chartConfig: ChartConfig = {
    [xField]: {
      label:
        xField.charAt(0).toUpperCase() + xField.slice(1).replace(/_/g, " "),
      color: "var(--chart-2)",
    },
  };

  // Add config for each numeric field
  numericFields.forEach((field, index) => {
    chartConfig[field] = {
      label: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " "),
      color: `var(--chart-${(index % 5) + 1})`,
    };
  });

  // For single-series bar charts, create config for each data item
  if (chartType === "bar" && numericFields.length === 1) {
    data.forEach((item, index) => {
      const itemName = item[xField];
      if (itemName) {
        chartConfig[itemName] = {
          label: itemName,
          color: `var(--chart-${(index % 5) + 1})`,
        };
      }
    });
  }

  let chartContent: React.ReactNode;

  switch (chartType) {
    case "bar":
      chartContent = (
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey={xField}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatXAxisTick}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {numericFields.length === 1 ? (
              // Single series - different color for each bar
              <Bar dataKey={numericFields[0]} radius={[12, 12, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
                  />
                ))}
              </Bar>
            ) : (
              // Multi-series - same color for each series
              numericFields.map((field) => (
                <Bar
                  key={field}
                  dataKey={field}
                  fill={`var(--color-${field})`}
                  radius={[12, 12, 0, 0]}
                />
              ))
            )}
          </BarChart>
        </ChartContainer>
      );
      break;

    case "line":
      chartContent = (
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey={xField}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatXAxisTick}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {numericFields.map((field) => (
              <Line
                key={field}
                dataKey={field}
                stroke={`var(--color-${field})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      );
      break;

    case "area":
      chartContent = (
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey={xField}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatXAxisTick}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {numericFields.map((field) => (
              <Area
                key={field}
                dataKey={field}
                fill={`var(--color-${field})`}
                fillOpacity={0.4}
                stroke={`var(--color-${field})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      );
      break;

    case "pie":
    case "arc":
      // For pie charts, create config for each data item
      const pieConfig: ChartConfig = {};
      data.forEach((item, index) => {
        const name = item[xField] || item.name || `Item ${index}`;
        pieConfig[name] = {
          label: name,
        };
      });

      chartContent = (
        <ChartContainer config={pieConfig}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey={yField}
              nameKey={xField}
              cx="50%"
              cy="50%"
              innerRadius={60}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`var(--chart-${(index % 5) + 1})`}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      );
      break;

    default:
      // Default to bar chart
      chartContent = (
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              opacity={0.3}
            />
            <XAxis
              dataKey={xField}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatXAxisTick}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 12,
                opacity: 0.7,
              }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {numericFields.length === 1 ? (
              // Single series - different color for each bar
              <Bar dataKey={numericFields[0]} radius={[12, 12, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--chart-${(index % 5) + 1})`}
                  />
                ))}
              </Bar>
            ) : (
              // Multi-series - same color for each series
              numericFields.map((field) => (
                <Bar
                  key={field}
                  dataKey={field}
                  fill={`var(--color-${field})`}
                  radius={[12, 12, 0, 0]}
                />
              ))
            )}
          </BarChart>
        </ChartContainer>
      );
      break;
  }

  return (
    <Card className="border-0 bg-card/50">
      <CardHeader className="pb-4">
        {spec.title && (
          <CardTitle className="text-lg font-semibold text-foreground">
            {spec.title}
          </CardTitle>
        )}
        {spec.description && (
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {spec.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">{chartContent}</CardContent>
    </Card>
  );
};
