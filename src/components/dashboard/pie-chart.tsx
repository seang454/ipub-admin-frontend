"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PapersResponse } from "@/types/paperType/paperType";

export const description = "An interactive pie chart with dark mode support";

// Enhanced chart config with distinct colors for each slice
const chartConfig = {
  desktop: {
    label: "Papers",
  },
  january: {
    label: "January",
    color: "hsl(221, 83%, 70%)", // Light Blue
  },
  february: {
    label: "February",
    color: "hsl(221, 83%, 70%)", // Light Blue (same as Jan for Jan-Feb pair)
  },
  march: {
    label: "March",
    color: "hsl(142, 71%, 65%)", // Light Green
  },
  april: {
    label: "April",
    color: "hsl(142, 71%, 65%)", // Light Green (same as Mar for Mar-Apr pair)
  },
  may: {
    label: "May",
    color: "hsl(262, 83%, 75%)", // Light Purple
  },
  june: {
    label: "June",
    color: "hsl(262, 83%, 75%)", // Light Purple (same as May for May-Jun pair)
  },
  july: {
    label: "July",
    color: "hsl(346, 77%, 70%)", // Light Pink/Red
  },
  august: {
    label: "August",
    color: "hsl(346, 77%, 70%)", // Light Pink/Red (same as Jul for Jul-Aug pair)
  },
  september: {
    label: "September",
    color: "hsl(38, 92%, 70%)", // Light Orange/Gold
  },
  october: {
    label: "October",
    color: "hsl(38, 92%, 70%)", // Light Orange/Gold (same as Sep for Sep-Oct pair)
  },
  november: {
    label: "November",
    color: "hsl(199, 89%, 65%)", // Light Cyan
  },
  december: {
    label: "December",
    color: "hsl(199, 89%, 65%)", // Light Cyan (same as Nov for Nov-Dec pair)
  },
} satisfies ChartConfig;

export function DashboardPieChart({
  papers,
}: {
  papers: PapersResponse | undefined;
}) {
  const id = "pie-interactive";
  const [mounted, setMounted] = React.useState(false);

  // Ensure we're mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const months = React.useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  // Get color from chartConfig based on month
  const getMonthColor = React.useCallback(
    (monthIndex: number): string => {
      const monthKey = months[
        monthIndex
      ].toLowerCase() as keyof typeof chartConfig;
      const config = chartConfig[monthKey];
      return config && "color" in config ? config.color : "hsl(var(--chart-1))";
    },
    [months]
  );

  // Generate 2-month combined chart data
  const desktopData = React.useMemo(() => {
    if (!papers?.papers.content) return [];
    const year = new Date().getFullYear();
    const data = [];

    for (let i = 0; i < 12; i += 2) {
      if (!months[i + 1]) break;
      const monthLabel = `${months[i]}-${months[i + 1]}`;
      const month1Str = (i + 1).toString().padStart(2, "0");
      const month2Str = (i + 2).toString().padStart(2, "0");

      const papersInMonth1 = papers.papers.content.filter((p) =>
        p.publishedAt?.startsWith(`${year}-${month1Str}-`)
      );
      const papersInMonth2 = papers.papers.content.filter((p) =>
        p.publishedAt?.startsWith(`${year}-${month2Str}-`)
      );

      const totalPapers = papersInMonth1.length + papersInMonth2.length;

      data.push({
        month: monthLabel,
        desktop: totalPapers,
        fill: getMonthColor(i),
        month1Count: papersInMonth1.length,
        month2Count: papersInMonth2.length,
        month1: months[i],
        month2: months[i + 1],
      });
    }
    return data;
  }, [papers, getMonthColor, months]);

  const [activeMonth, setActiveMonth] = React.useState(
    desktopData[0]?.month ?? ""
  );
  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth, desktopData]
  );

  if (!mounted) {
    return (
      <Card className="relative overflow-hidden border border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground">
            Interactive Pie Chart - Total Papers
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            January - December {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[320px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      data-chart={id}
      className="relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-card"
    >
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="relative flex-row items-start space-y-0 pb-4">
        <div className="grid gap-2 flex-1">
          <CardTitle className="text-xl font-bold text-foreground">
            Interactive Pie Chart - Total Papers
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            January - December {new Date().getFullYear()}
          </CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-9 w-[140px] rounded-lg border-border bg-card shadow-sm"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="rounded-lg border-border bg-popover"
          >
            {desktopData.map((item) => (
              <SelectItem
                key={item.month}
                value={item.month}
                className="rounded-lg hover:bg-muted"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{
                      backgroundColor: item.fill,
                    }}
                  />
                  {item.month}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="relative flex flex-1 justify-center pb-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[320px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: data.fill }}
                        />
                        <span className="font-semibold text-foreground">
                          {data.month}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">
                            {data.month1}:
                          </span>
                          <span className="font-medium text-foreground">
                            {data.month1Count}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">
                            {data.month2}:
                          </span>
                          <span className="font-medium text-foreground">
                            {data.month2Count}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-border pt-1 mt-1">
                          <span className="font-medium text-foreground">
                            Total:
                          </span>
                          <span className="font-bold text-primary">
                            {data.desktop}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={70}
              strokeWidth={2}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 12}
                    className="drop-shadow-lg transition-all duration-300"
                  />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 28}
                    innerRadius={outerRadius + 16}
                    className="opacity-30 transition-all duration-300"
                  />
                </g>
              )}
            >
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {desktopData[
                            activeIndex
                          ]?.desktop?.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 28}
                          className="fill-muted-foreground text-sm"
                        >
                          Papers
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
