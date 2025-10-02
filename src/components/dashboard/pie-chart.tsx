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
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PapersResponse } from "@/types/paperType/paperType";

export const description = "An interactive pie chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "hsl(221, 83%, 53%)", // Vibrant blue
  },
  february: {
    label: "February",
    color: "hsl(221, 83%, 53%)", // Vibrant blue (same as January for the pair)
  },
  march: {
    label: "March",
    color: "hsl(142, 71%, 45%)", // Vibrant green
  },
  april: {
    label: "April",
    color: "hsl(142, 71%, 45%)", // Vibrant green (same as March for the pair)
  },
  may: {
    label: "May",
    color: "hsl(262, 83%, 58%)", // Vibrant purple
  },
  june: {
    label: "June",
    color: "hsl(262, 83%, 58%)", // Vibrant purple (same as May for the pair)
  },
  july: {
    label: "July",
    color: "hsl(346, 77%, 50%)", // Vibrant red
  },
  august: {
    label: "August",
    color: "hsl(346, 77%, 50%)", // Vibrant red (same as July for the pair)
  },
  september: {
    label: "September",
    color: "hsl(38, 92%, 50%)", // Vibrant orange
  },
  october: {
    label: "October",
    color: "hsl(38, 92%, 50%)", // Vibrant orange (same as September for the pair)
  },
  november: {
    label: "November",
    color: "hsl(199, 89%, 48%)", // Vibrant cyan
  },
  december: {
    label: "December",
    color: "hsl(199, 89%, 48%)", // Vibrant cyan (same as November for the pair)
  },
} satisfies ChartConfig;

export function DashboardPieChart({
  papers,
}: {
  papers: PapersResponse | undefined;
}) {
  const id = "pie-interactive";
  const months = [
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
  ];

  type ChartItem = {
    color?: string; // Light mode color
    darkColor?: string; // Optional dark mode color
  };

  // Example chartConfig
  const chartConfig: Record<string, ChartItem> = {
    january: { color: "#ff0000", darkColor: "#ff8888" },
    february: { color: "#00ff00", darkColor: "#88ff88" },
    march: { color: "#0000ff", darkColor: "#8888ff" },
    // add remaining months
  };

  // generate 2-month combined chart data
  const desktopData = React.useMemo(() => {
    if (!papers?.papers.content) return [];
    console.log("papers :>> ", papers);
    const year = new Date().getFullYear(); // use current year dynamically
    const data = [];
    for (let i = 0; i < 12; i += 2) {
      if (!months[i + 1]) break;
      const monthLabel = `${months[i]}-${months[i + 1]}`;
      const month1Str = (i + 1).toString().padStart(2, "0");
      const month2Str = (i + 2).toString().padStart(2, "0");

      const usersInMonth1 = papers.papers.content.filter((p) =>
        p.publishedAt?.startsWith(`${year}-${month1Str}-`)
      );
      const usersInMonth2 = papers.papers.content.filter((p) =>
        p.publishedAt?.startsWith(`${year}-${month2Str}-`)
      );

      const monthKey = months[i].toLowerCase();
      const config = chartConfig[monthKey] as ChartItem | undefined;

      data.push({
        month: monthLabel,
        desktop: usersInMonth1.length + usersInMonth2.length,
        fill: config?.color || `hsl(${i * 60}, 70%, 50%)`,
        // optional: dark mode fill
        fillDark: config?.darkColor || `hsl(${i * 60}, 70%, 40%)`,
      });
    }
    return data;
  }, [papers]);

  const [activeMonth, setActiveMonth] = React.useState(
    desktopData[0]?.month ?? ""
  );
  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth, desktopData]
  );

  return (
    <Card
      data-chart={id}
      className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/20"
    >
      <ChartStyle id={id} config={chartConfig} />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent pointer-events-none" />
      <CardHeader className="relative flex-row items-start space-y-0 pb-4">
        <div className="grid gap-2">
          <CardTitle className="text-xl font-bold text-primary dark:text-slate-100">
            Interactive Pie Chart - Total Papers
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-slate-400">
            January - December {new Date().getFullYear()}
          </CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-9 w-[140px] rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm dark:bg-slate-700 dark:border-slate-600"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-sm dark:bg-slate-800 dark:border-slate-700"
          >
            {desktopData.map((item) => (
              <SelectItem
                key={item.month}
                value={item.month}
                className="rounded-lg [&_span]:flex hover:bg-muted/50 dark:hover:bg-slate-700"
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
              content={
                <ChartTooltipContent
                  hideLabel
                  className="bg-popover/95 backdrop-blur-sm border-border/50 dark:bg-slate-800 dark:border-slate-700"
                />
              }
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
                    className="drop-shadow-lg"
                  />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 28}
                    innerRadius={outerRadius + 16}
                    className="opacity-30"
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
                          className="fill-foreground text-4xl font-bold dark:fill-slate-100"
                        >
                          {desktopData[
                            activeIndex
                          ]?.desktop?.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 28}
                          className="fill-muted-foreground text-sm dark:fill-slate-400"
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
