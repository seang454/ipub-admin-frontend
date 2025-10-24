"use client";

import { TrendingUp, BarChart3, Users, BookOpen, Award } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DashboardStatsProps } from "./dashbaord-stats";
import { useMemo } from "react";

export const description = "A modern area chart with enhanced styling";

const chartConfig = {
  users: {
    label: "Total Users",
    color: "hsl(210, 60%, 65%)", // Light Blue
    icon: Users,
  },
  students: {
    label: "Students",
    color: "hsl(160, 55%, 60%)", // Light Green
    icon: BarChart3,
  },
  mentors: {
    label: "Advisors",
    color: "hsl(270, 60%, 70%)", // Light Purple
    icon: Award,
  },
  papers: {
    label: "Papers",
    color: "hsl(340, 65%, 65%)", // Light Pink
    icon: BookOpen,
  },
} satisfies ChartConfig;

export function ChartAreaStackedExpand({
  papers,
  user,
  students,
  mentors,
}: DashboardStatsProps) {
  type CombinedData = {
    month: string;
    users: number;
    students: number;
    mentors: number;
    papers: number;
  };

  const combinedData: CombinedData[] = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Get month names for current year
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(currentYear, i, 1).toLocaleString("default", { month: "long" })
    );

    // Count papers by month
    const paperCounts =
      papers?.papers.content.reduce<Record<string, number>>((acc, paper) => {
        if (paper.publishedAt) {
          const date = new Date(paper.publishedAt);
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          if (year === currentYear) {
            acc[month] = (acc[month] || 0) + 1;
          }
        }
        return acc;
      }, {}) || {};

    // Count users by month
    const userCounts =
      user?.reduce<Record<string, number>>((acc, u) => {
        if (u.createDate) {
          const date = new Date(u.createDate);
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          if (year === currentYear) {
            acc[month] = (acc[month] || 0) + 1;
          }
        }
        return acc;
      }, {}) || {};

    // Count students by month
    const studentCounts =
      students?.reduce<Record<string, number>>((acc, student) => {
        if (student.createDate) {
          const date = new Date(student.createDate);
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          if (year === currentYear) {
            acc[month] = (acc[month] || 0) + 1;
          }
        }
        return acc;
      }, {}) || {};

    // Count mentors by month
    const mentorCounts =
      mentors?.reduce<Record<string, number>>((acc, mentor) => {
        if (mentor.createDate) {
          const date = new Date(mentor.createDate);
          const month = date.toLocaleString("default", { month: "long" });
          const year = date.getFullYear();
          if (year === currentYear) {
            acc[month] = (acc[month] || 0) + 1;
          }
        }
        return acc;
      }, {}) || {};

    // Combine all data
    return monthNames.map((month) => ({
      month,
      users: userCounts[month] || 0,
      students: studentCounts[month] || 0,
      mentors: mentorCounts[month] || 0,
      papers: paperCounts[month] || 0,
    }));
  }, [papers, user, students, mentors]);

  // Calculate totals for display
  const totals = useMemo(() => {
    return combinedData.reduce(
      (acc, month) => ({
        users: acc.users + month.users,
        students: acc.students + month.students,
        mentors: acc.mentors + month.mentors,
        papers: acc.papers + month.papers,
      }),
      { users: 0, students: 0, mentors: 0, papers: 0 }
    );
  }, [combinedData]);

  const chartId = "area-chart-stacked";

  return (
    <Card
      data-chart={chartId}
      className="border border-border shadow-sm hover:shadow-md transition-all duration-200 bg-card"
    >
      <ChartStyle id={chartId} config={chartConfig} />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-foreground">
              Platform Analytics Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Comprehensive metrics across all platform channels for{" "}
              {new Date().getFullYear()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {Object.entries(chartConfig).map(([key, config]) => {
            const Icon = config.icon;
            const total = totals[key as keyof typeof totals];
            return (
              <div
                key={key}
                className="flex flex-col gap-2 p-3 rounded-lg bg-muted/20 border border-border"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.3}
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickCount={5}
              />

              <ChartTooltip
                cursor={{
                  stroke: "var(--accent)",
                  strokeWidth: 2,
                  fillOpacity: 0.1,
                }}
                content={
                  <ChartTooltipContent
                    className="bg-card border border-border shadow-lg rounded-lg"
                    labelClassName="font-semibold text-foreground"
                  />
                }
              />

              <Area
                dataKey="users"
                type="monotone"
                fill="var(--color-users)"
                fillOpacity={0.3}
                stroke="var(--color-users)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="students"
                type="monotone"
                fill="var(--color-students)"
                fillOpacity={0.3}
                stroke="var(--color-students)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="mentors"
                type="monotone"
                fill="var(--color-mentors)"
                fillOpacity={0.3}
                stroke="var(--color-mentors)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="papers"
                type="monotone"
                fill="var(--color-papers)"
                fillOpacity={0.3}
                stroke="var(--color-papers)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">
                Total:{" "}
                {totals.users +
                  totals.students +
                  totals.mentors +
                  totals.papers}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Combined platform activity
            </div>
          </div>
          <div className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-full">
            {new Date().getFullYear()} Analytics
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
