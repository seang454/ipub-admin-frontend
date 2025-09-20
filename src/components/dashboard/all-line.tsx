"use client"

import { TrendingUp, BarChart3, Users, BookOpen, Award } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A modern area chart with enhanced styling"

const chartData = [
  { month: "January", desktop: 186, mobile: 80, mentor: 120, publication: 90 },
  { month: "February", desktop: 305, mobile: 200, mentor: 150, publication: 110 },
  { month: "March", desktop: 237, mobile: 120, mentor: 130, publication: 100 },
  { month: "April", desktop: 73, mobile: 190, mentor: 90, publication: 70 },
  { month: "May", desktop: 209, mobile: 130, mentor: 140, publication: 120 },
  { month: "June", desktop: 214, mobile: 140, mentor: 160, publication: 130 },
]

const chartConfig = {
  desktop: {
    label: "Desktop Users",
    color: "hsl(210, 60%, 60%)", // Lighter blue
    icon: BarChart3,
  },
  mobile: {
    label: "Mobile Users",
    color: "hsl(160, 60%, 55%)", // Lighter green
    icon: Users,
  },
  mentor: {
    label: "Mentorship Sessions",
    color: "hsl(45, 80%, 60%)", // Lighter yellow
    icon: Award,
  },
  publication: {
    label: "Publications",
    color: "hsl(340, 70%, 65%)", // Lighter pink
    icon: BookOpen,
  },
} satisfies ChartConfig

export function ChartAreaStackedExpand() {
  return (
    <Card className="bg-gradient-to-br from-background via-card/50 to-muted/30 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Platform Analytics Overview
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Comprehensive metrics across all platform channels for the last 6 months
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {Object.entries(chartConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">{config.label}</span>
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />

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
                cursor={{ stroke: "var(--accent)", strokeWidth: 2, fillOpacity: 0.5 }} // Changed strokeOpacity to fillOpacity
                content={
                  <ChartTooltipContent
                    className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-lg rounded-lg"
                    labelClassName="font-semibold text-popover-foreground"
                  />
                }
              />

              <Area
                dataKey="publication"
                type="monotone"
                fill="var(--color-publication)"
                fillOpacity={0.3}
                stroke="var(--color-publication)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="mentor"
                type="monotone"
                fill="var(--color-mentor)"
                fillOpacity={0.3}
                stroke="var(--color-mentor)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="mobile"
                type="monotone"
                fill="var(--color-mobile)"
                fillOpacity={0.3}
                stroke="var(--color-mobile)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="monotone"
                fill="var(--color-desktop)"
                fillOpacity={0.3}
                stroke="var(--color-desktop)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">+5.2%</span>
            </div>
            <div className="text-sm text-muted-foreground">Growth compared to previous period</div>
          </div>
          <div className="text-sm font-medium text-card-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            January - June 2024
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}