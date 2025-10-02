"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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

export const description = "A bar chart with a label";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MentorChartBarLabel({
  students,
}: {
  students: User[] | undefined;
}) {
  const combinedData = useMemo(() => {
    if (!students) return [];

    // Dynamic month names
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2024, i, 1).toLocaleString("default", { month: "long" })
    );

    // Initialize counts
    const monthCounts: Record<string, number> = {};
    monthNames.forEach((month) => {
      monthCounts[month] = 0;
    });

    // Count students per month
    students.forEach((student) => {
      const date = new Date(student.createDate); // adjust field name
      const monthName = date.toLocaleString("default", { month: "long" });
      if (monthCounts[monthName] !== undefined) {
        monthCounts[monthName]++;
      }
    });

    // Combine every 2 months
    const result: { month: string; desktop: number }[] = [];
    for (let i = 0; i < monthNames.length; i += 2) {
      const monthLabel = `${monthNames[i].slice(0, 3)}-${monthNames[
        i + 1
      ].slice(0, 3)}`; // Jan-Feb
      const desktopCount =
        monthCounts[monthNames[i]] + monthCounts[monthNames[i + 1]];
      result.push({ month: monthLabel, desktop: desktopCount });
    }

    return result;
  }, [students]);

  console.log("combinedData :>> ", combinedData);

  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold text-primary">
          Bar Chart - Total Students
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Combined two months per bar
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={combinedData} margin={{ top: 20 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-muted-foreground"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="bg-popover/95 backdrop-blur-sm border-border/50 shadow-lg"
                />
              }
            />
            <Bar
              dataKey="desktop"
              fill="#3B82F6" // bar fill color
              radius={12}
              className="drop-shadow-sm"
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-blue-500 font-medium" // ✅ set label color
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="relative flex-col items-start gap-3 text-sm border-t border-border/20 bg-muted/10">
        <div className="flex gap-2 leading-none font-semibold text-primary">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total students for every two months
        </div>
      </CardFooter>
    </Card>
  );
}
