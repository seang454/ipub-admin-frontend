"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  ResponsiveContainer,
  Tooltip,
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
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { User } from "@/types/userType/userType";
import { useMemo } from "react";

export const description =
  "A smooth gradient line chart with responsive design";

type CombinedData = { month: string; desktop: number };

const chartConfig = {
  desktop: {
    label: "Mentors",
    color: "var(--chart-1)", // Tailwind/shadcn theme color for adaptive dark/light mode
  },
} satisfies ChartConfig;

export function PdashboardLineChart({ mentors }: { mentors?: User[] }) {
  const combinedData: CombinedData[] = useMemo(() => {
    if (!mentors) return [];

    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2024, i, 1).toLocaleString("default", { month: "long" })
    );

    const monthCounts = mentors.reduce<Record<string, number>>(
      (acc, mentor) => {
        const month = new Date(mentor.createDate).toLocaleString("default", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {}
    );

    return monthNames.reduce<CombinedData[]>((result, month, i) => {
      if (i % 2 === 0 && monthNames[i + 1]) {
        const label = `${month.slice(0, 3)}-${monthNames[i + 1].slice(0, 3)}`;
        const count =
          (monthCounts[month] || 0) + (monthCounts[monthNames[i + 1]] || 0);
        result.push({ month: label, desktop: count });
      }
      return result;
    }, []);
  }, [mentors]);

  // Calculate simple trend %
  const trendPercentage = useMemo(() => {
    if (combinedData.length < 2) return 0;
    const last = combinedData[combinedData.length - 1].desktop;
    const prev = combinedData[combinedData.length - 2].desktop;
    if (prev === 0) return 0;
    return (((last - prev) / prev) * 100).toFixed(1);
  }, [combinedData]);

  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm">
      {/* background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent pointer-events-none" />

      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold text-dynamic2">
          Line Chart – Total Mentors
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Combined every two months
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={combinedData}
              margin={{ top: 20, left: 12, right: 12, bottom: 0 }}
            >
              {/* Soft grid */}
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.15}
              />

              {/* Month axis */}
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                tick={{ fill: "var(--dynamic2)" }} // <-- change this to white
              />

              {/* Gradient fill definition */}
              <defs>
                <linearGradient id="mentorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              {/* Tooltip */}
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-lg"
                  />
                }
              />

              {/* Smooth animated line with gradient area */}
              <Line
                type="monotone"
                dataKey="desktop"
                stroke={chartConfig.desktop.color}
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
                activeDot={{
                  r: 6,
                  stroke: chartConfig.desktop.color,
                  strokeWidth: 2,
                  fill: "var(--dynamic2)",
                }}
                fill="url(#mentorGradient)"
                fillOpacity={1}
                className="drop-shadow-sm"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="relative flex-col items-start gap-3 text-sm border-t border-border/20 bg-muted/10">
        <div className="flex gap-2 leading-none font-semibold text-dynamic2">
          Trending {Number(trendPercentage) >= 0 ? "up" : "down"} by{" "}
          {Math.abs(Number(trendPercentage))}% this period
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total mentors for every two months
        </div>
      </CardFooter>
    </Card>
  );
}
